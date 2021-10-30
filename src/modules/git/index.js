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

function getLatestTag(scheme, format, config, versioning) {
  const revs = execSync('git rev-list --tags --max-count=10').toString().trim().split(/[\r\n]/)
  if (!revs || !revs[0]) {
    return ''
  }

  for (var i = 0; i < revs.length; i++) {
    const rev = revs[i]
    let result = execSync(`git describe --tags ${rev}`).toString().trim()

    if (result.indexOf('fatal') !== -1) {
      return ''
    }

    if (config.get('versioning.prefix')) {
      result = result.slice(config.get('versioning.prefix').length)
    }

    const valid = versioning.isValid(result, scheme, format)

    if (valid === true) {
      return config.get('versioning.prefix') + result
    }
  }

  return ''
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
    const [owner, ...rest] = url.split(':')[1].replace(/(\.git)$/, '').split('/')
    const repo = rest[rest.length - 1]
    const path = [owner].concat(rest).join('/')
    return {owner, repo, url, path}
  }

  if (url.indexOf('http') === 0) {
    const [owner, ...rest] = url.replace(/(\.git)$/, '').split('/').filter((p, i) => i > 2)
    const repo = rest[rest.length - 1]
    const path = [owner].concat(rest).join('/')
    return {owner, repo, url, path}
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
    'git push --atomic origin ' + branch + ' ' + nextTag + ''
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
