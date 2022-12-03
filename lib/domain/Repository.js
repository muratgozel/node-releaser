import {spawnSync} from 'node:child_process';

class Repository {
  status = []
  error = null
  projectPath = null
  projectConfiguration = null
  versioner = null
  serviceProvider = ''
  remoteUrl = ''
  currentBranch = ''
  latestRelevantTag = ''
  initialRelease = false
  owner = null
  repo = null
  project = null
  spawnOpts = {}

  constructor({projectPath, projectConfiguration, versioner}) {
    this.projectPath = projectPath
    this.projectConfiguration = projectConfiguration
    this.versioner = versioner
    this.spawnOpts = {
      encoding: 'utf8',
      cwd: this.projectPath
    }
  }

  validate() {
    if (!this.isGitDir()) {
      return new Error('Looks like this is not a git repository.');
    }

    const resolved = this.resolveRemote()
    if (resolved instanceof Error) {
      return resolved
    }

    const found = this.findCurrentBranch()
    if (found instanceof Error) {
      return found
    }

    return true
  }

  isGitDir() {
    /*
    "git rev-parse --git-dir" command:
      - prints the path of the .git folder even in project's subfolders
      - prints to stderr with "fatal:" prefix if it's not a git repository
     */
    const git = spawnSync('git', ['rev-parse', '--git-dir'], this.spawnOpts)

    if (git.stderr && git.stderr.length > 0) {
      return false;
    }

    if (!git.stdout || (git.stdout && git.stdout.trim().length === 0)) {
      return false;
    }

    return /(\.git)$/.test(git.stdout.trim().split(/[\r\n]/)[0].trim())
  }

  resolveRemote() {
    /*
    Parses "Push URL" from the command stdout. There are two options for the url format:
    https://github.com/muratgozel/web.git and git@github.com:muratgozel/test.git
     */
    const git = spawnSync('git', ['remote', 'show', 'origin'], this.spawnOpts)

    if (git.stderr && git.stderr.trim().length > 0) {
      return new Error(`Unexpected error while resolving remote origin: ${git.stderr.trim()}`)
    }

    const matches = git.stdout.trim().split(/[\r\n]/).filter(line => /(Push)[\s]+(URL:)/.test(line))
    if (!matches || matches.length < 1) {
      return new Error(`Couldn't find push url.`)
    }

    const url = matches[0].trim().split(' ').reverse()[0]
    this.remoteUrl = url
    this.serviceProvider = url.indexOf('github.com') !== -1 ? 'github' : url.indexOf('gitlab.com') !== -1 ? 'gitlab' : ''
    const result = url.replace(/((https:\/\/)|(git@))((github\.com)|(gitlab\.com))(:|\/)/, '').replace(/(\.git)$/, '').split('/')
    if (result.length !== 2 && result.length !== 3) {
      return new Error(`Couldn't resolve the following url: ${url}`)
    }

    this.owner = result[0]
    this.repo = result[result.length - 1]
    this.project = result.length === 3 ? result[1] : ''

    return true
  }

  findCurrentBranch() {
    const git = spawnSync(`git`, ['symbolic-ref', '--short', 'HEAD'], this.spawnOpts)

    this.currentBranch = ''

    if (git.stderr && git.stderr.length > 0) {
      return new Error(git.stderr.trim())
    }
    else {
      this.currentBranch = git.stdout.trim()
    }

    return this.currentBranch
  }

  getStatus() {
    /*
    "git status -s" command:
      - prints to stderr with "fatal:" prefix when the project is not a git repository
      - prints nothing if there is no change in the project
      - prints to stdout with changes in the codebase separated by line break
     */
    const git = spawnSync(`git`, ['status', '-s'], this.spawnOpts)

    this.status = []

    if (git.stderr && git.stderr.length > 0) {
      return new Error(git.stderr.trim())
    }
    else {
      const arr = git.stdout.trim().split(/[\r\n]/).filter(line => line.trim().length > 0)
      if (arr.length > 0 && arr[0].length > 0) {
        this.status = arr
      }
    }

    return this.status
  }

  getLatestRelevantTag(opts) {
    if (opts.initialRelease) {
      this.initialRelease = true

      return ''
    }

    const revisions = spawnSync(`git`, ['rev-list', '--tags', '--max-count=16'], this.spawnOpts)

    if (revisions.stderr.trim() && revisions.stderr.trim().length > 0) {
      return new Error(revisions.stderr.trim())
    }

    if (revisions.stdout.trim().length === 0) {
      this.initialRelease = true

      return ''
    }

    const hashes = revisions.stdout.trim().split(/[\r\n]/)
    const versionPrefix = this.projectConfiguration.versioningPrefix || ''

    for (const hash of hashes) {
      const tag = spawnSync(`git`, ['describe', '--tags', hash], this.spawnOpts)

      if (tag.stderr && tag.stderr.length > 0) {
        continue;
      }

      const version = tag.stdout.trim().slice(versionPrefix.length)

      if (this.versioner.isValidTag(version) === true) {
        this.latestRelevantTag = version
        return this.latestRelevantTag
      }
    }

    return new Error(`Bunch of tags found but none of them was relevant to the versioning scheme. ` +
      `Use the "--initial-release" option to if you want releaser treat this as initial release.`)
  }

  isVersionTagUnique(_tag) {
    const tag = this.projectConfiguration.content.versioningPrefix + _tag
    const git = spawnSync('git', ['rev-parse', tag], this.spawnOpts)

    return git.stderr.trim().startsWith('fatal:')
  }

  add() {
    const add = spawnSync(`git`, ['add', '--all', '.'], this.spawnOpts)

    if (add.stderr.trim().length > 0) {
      return new Error(add.stderr.trim())
    }

    return true;
  }

  commit(opts) {
    const args = ['commit']
    for (const message of opts.message) {
      args.push('-m')
      args.push(message)
    }
    const commit = spawnSync(`git`, args, this.spawnOpts)

    if (commit.stderr && commit.stderr.length > 0) {
      return new Error(commit.stderr)
    }

    const re = /(?!\[[^\s]+)(?!\s)([a-z0-9]+)(?=\])/
    const matches = commit.stdout.trim().split(/[\r\n]/)[0].trim().match(re)
    if (Array.isArray(matches) && matches.length > 0 && matches[0].length === 7) {
      return matches[0]
    }

    return new Error(`Couldn't read commit hash. The stdout of the commin command was "${commit.stdout.trim()}"`)
  }

  tag(_tag, abbrCommitHash=null, opts) {
    const tag = this.projectConfiguration.content.versioningPrefix + _tag
    const args = ['tag', '-a', tag]
    for (const message of opts.message) {
      args.push('-m')
      args.push(message)
    }
    if (typeof abbrCommitHash && abbrCommitHash.length > 0) {
      args.push(abbrCommitHash)
    }
    const git = spawnSync('git', args, this.spawnOpts)

    if (git.stderr && git.stderr.length > 0) {
      return new Error(git.stderr.trim())
    }

    return true;
  }

  push(_tag) {
    const tag = this.projectConfiguration.content.versioningPrefix + _tag

    if (this.currentBranch.length === 0) {
      return new Error(`Couldn't get branch name from git.`)
    }

    const pushBranch = spawnSync('git', ['push', '--atomic', 'origin', this.currentBranch], this.spawnOpts)

    if (pushBranch.stderr.trim().startsWith('fatal:') || pushBranch.stderr.trim().startsWith('error:')) {
      return new Error(`Failed to push: ${pushBranch.stderr.trim()}`)
    }

    const pushTag = spawnSync('git', ['push', '--atomic', 'origin', tag], this.spawnOpts)

    if (pushTag.stderr.trim().startsWith('fatal:') || pushTag.stderr.trim().startsWith('error:')) {
      return new Error(`Failed to push: ${pushTag.stderr.trim()}`)
    }

    return true;
  }
}

export default Repository