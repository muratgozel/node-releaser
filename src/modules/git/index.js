const {execSync} = require('child_process')

function verifyCodebase() {
  const changes = execSync('git status -s')
    .toString()
    .split(/[\r\n]/)
    .filter(line => line.trim().length > 0)

  if (!changes || changes.length < 1) {
    throw new Error('Nothing have changed in the codebase.')
  }

  return true
}

function getLatestTag() {
  const rev = execSync('git rev-list --tags --max-count=1').toString().trim()
  if (!rev) {
    return ''
  }

  const cmd = 'git describe --tags ' + rev
  const result = execSync(cmd).toString().trim()

  if (result.indexOf('fatal') !== -1) {
    return ''
  }

  return result
}

function getChangelogForTag(tag) {
  // get hashes of last 1000 commits
  const output = execSync('git log --pretty=oneline --decorate=short -1000')
    .toString()
    .split(/[\n\r]/)
    .filter(l => l.length > 0)

  // get hashes of the commit messages for the tag
  const re = /([a-z0-9]+)(\s\(.*\))?/
  const hashes = []
  for (var i = 0; i < output.length; i++) {
    const [empty, hash, refstr] = output[i].match(re)
    const foundtags = typeof refstr == 'string'
      ? refstr
          .trim()
          .slice(1, -1)
          .replace('HEAD -> ', '')
          .split(',')
          .filter(s => s.indexOf('tag: ') !== -1)
          .map(s => s.split(':')[1].trim())
      : []

    if (typeof refstr == 'string' && foundtags.indexOf(tag) !== -1) {
      hashes.push(hash)
    }
    else if (typeof refstr == 'string' && foundtags.length > 0 && hashes.length > 0) {
      break;
    }
    else if (hashes.length > 0) {
      hashes.push(hash)
    }
    else {}
  }

  if (hashes.length === 0) {
    return []
  }

  console.log('hashes:', hashes)

  // get commit messages including multiline
  const revrange = [hashes[hashes.length-1], hashes[0]]
  const output2 = execSync(`git log ${revrange[0]}..${revrange[1]} --format="%H %s%n%b"`)
    .toString()
    .split(/[\n\r]{2}/)
    .filter(l => l.length > 0)
  const msgsByCommit = output2.reduce(function(memo, item) {
    memo[item.slice(0, hashes[0].length)] = item.slice(hashes[0].length + 1).split(/[\n\r]/)
    return memo
  }, {})

  console.log('msgsByCommit:', msgsByCommit)

  return hashes.reduce(function(memo, hash) {
    if (msgsByCommit.hasOwnProperty(hash)) {
      msgsByCommit[hash].map(msg => memo.push(msg))
    }
    return memo
  }, [])
}

function getBranchName() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
}

function getRemoteOrigin() {
  const arr = execSync('git remote show origin')
    .toString()
    .trim()
    .split(/[\n\r]/)
    .filter(l => l.indexOf('Push  URL') !== -1)

  if (!arr || arr.length === 0) {
    throw new Error('Remote origin not found.')
  }

  const url = arr[0].trim().split(' ').reverse()[0]

  if (url.indexOf('git') === 0) {
    const [owner, repo] = url.split(':')[1].replace(/(\.git)$/, '').split('/')
    return {owner, repo, url}
  }

  if (url.indexOf('http') === 0) {
    const [repo, owner] = url.split('/').reverse()
    return {owner, repo, url}
  }

  throw new Error('Remote origin not found.')
}

function push(nextTag, messages) {
  const msgscmd = '-m "' + messages.join('" -m "') + '"'
  const branch = getBranchName()
  const commands = [
    'git tag -a "' + nextTag + '" ' + msgscmd,
    'git add .',
    'git commit ' + msgscmd,
    'git push -u origin ' + branch + ' --tags'
  ]
  for (let i = 0; i < commands.length; i++) {
    try {
      execSync(commands[i], {stdio: 'inherit', encoding: 'utf8'})
    } catch (e) {
      throw e
    }
  }
}

module.exports = {
  verifyCodebase: verifyCodebase,
  getLatestTag: getLatestTag,
  getChangelogForTag: getChangelogForTag,
  getBranchName: getBranchName,
  getRemoteOrigin: getRemoteOrigin,
  push: push
}
