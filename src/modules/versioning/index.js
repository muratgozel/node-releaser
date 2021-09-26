const semver = require('semver')
const calver = require('calver')

function generateNextTag(level, currentTag, scheme, calverFormat, {forceCalverFormat}) {
  let nextTag = null

  if (forceCalverFormat) {
    nextTag = calver.init(calverFormat)
    nextTag = calver.inc(calverFormat, nextTag, level)
  }
  else if (currentTag == '') {
    if (scheme == 'semver') nextTag = '0.1.0'
    else nextTag = calver.init(calverFormat)
  }
  else {
    if (scheme == 'semver') nextTag = semver.inc(currentTag, level)
    else nextTag = calver.inc(calverFormat, currentTag, level)
  }

  return nextTag
}

module.exports = {
  generateNextTag
}
