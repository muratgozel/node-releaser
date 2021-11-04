const semver = require('semver')
const calver = require('calver')

function generateNextTag(level, currentTag, scheme, calverFormat, opts={}) {
  const forceCalverFormat = opts.forceCalverFormat || false
  const modifierTags = ['rc', 'beta', 'alpha', 'dev']
  let nextTag = null

  if (scheme == 'semver') {
    const levels = ['major', 'minor', 'patch']
    if (currentTag == '') currentTag = '0.0.0'
    if (modifierTags.indexOf(level) !== -1) {
      nextTag = semver.inc(currentTag, 'prerelease', level)
    }
    else if (levels.indexOf(level) !== -1) {
      nextTag = semver.inc(currentTag, level)
    }
    else if (level.indexOf('.') !== -1) {
      nextTag = semver.inc(currentTag, level.split('.')[0], level.split('.')[1])
    }
    else {
      nextTag = semver.inc(currentTag, level)
    }
  }

  if (scheme == 'calver') {
    if (forceCalverFormat) {
      nextTag = calver.inc(calverFormat, '', level)
    }
    else if (currentTag == '') {
      nextTag = calver.inc(calverFormat, '', level)
    }
    else {
      nextTag = calver.inc(calverFormat, currentTag, level)
    }
  }

  return nextTag
}

function isValid(tag, scheme, format='') {
  if (scheme == 'semver') {
    return typeof semver.valid(tag) === 'string'
  }

  if (scheme == 'calver') {
    try {
      calver.valid(format, tag)
      return true
    } catch (e) {
      return false
    }
  }
}

module.exports = {
  generateNextTag, isValid
}
