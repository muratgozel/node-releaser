const {execSync} = require('child_process')

function verifyCodebase() {
  const changes = execSync('git status -s')
    .toString()
    .split(/[\r\n]/)
    .filter(line => line.trim().length > 0)

  if (!changes || changes.length < 1) {
    throw new Error('Nothing have changed in the codebase.')
  }

  getBranchName()

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
  return execSync(`git log --pretty=format:"%B" ${tag}..`)
    .toString()
    .split(/[\n\r]{2}/)
    .filter(l => l.length > 0)
    .map(l => l.trim())
}

function getBranchName() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch (e) {
    throw new Error('No branch found. Make a commit if this is an empty repository.')
  }
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
