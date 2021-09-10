const semver = require('semver')
const calver = require('calver')

function generateNextTag(level, currentTag, scheme, calverFormat) {
  let nextTag = null

  if (currentTag == '') {
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
