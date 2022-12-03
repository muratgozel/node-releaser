import calver from "calver";
import semver from 'semver';

class Versioner {
  projectConfiguration = null
  scheme = null
  versioners = new Map()

  constructor({projectConfiguration}) {
    this.projectConfiguration = projectConfiguration

    this.versioners.set('semver', semver)
    this.versioners.set('calver', calver)
  }

  static validateCalverFormat(str) {
    try {
      calver.validateFormat(str, [])
      return true
    }
    catch (e) {
      return false
    }
  }

  validate() {
    if (!(this.projectConfiguration && this.projectConfiguration.content)) {
      return new Error(`Versioner failed to detect scheme, releaser configuration not exist.`)
    }

    const scheme = this.projectConfiguration.content.versioningScheme

    if (!this.versioners.has(scheme)) {
      return new Error(`Unsupported or not recognized versioning scheme${scheme.length > 0 ? ` "${scheme}"` : ''}.`)
    }

    this.scheme = scheme

    return true
  }

  isValidTag(tag) {
    const verPrefixLen = this.projectConfiguration.content.versioningPrefix.length

    if (this.scheme === 'semver') {
      try {
        return typeof semver.valid(tag.slice(verPrefixLen)) === 'string'
      }
      catch (e) {
        return new Error(`Semver couldn't validate this tag: "${tag.slice(verPrefixLen)}".`, {cause: e})
      }
    }

    if (this.scheme === 'calver') {
      const format = this.projectConfiguration.content.versioningFormat

      try {
        return calver.isValid(format, tag.slice(verPrefixLen))
      }
      catch (e) {
        return new Error(`Calver couldn't validate this tag: "${tag.slice(verPrefixLen)}".`, {cause: e})
      }
    }

    return false
  }

  next(repo, level) {
    const verPrefixLen = this.projectConfiguration.content.versioningPrefix.length
    if (this.scheme === 'semver') {
      const tag = repo.initialRelease ? '0.0.0' : repo.latestRelevantTag.slice(verPrefixLen)
      const levels = level.split('.')

      if (levels.length === 1) {
        try {
          const result = semver.inc(tag, level)
          if (!result) {
            return new Error(`Semver couldn't increment this tag: "${tag}" with this level: "${level}"`)
          }
          return result
        }
        catch (e) {
          return new Error(`Semver couldn't increment this tag: "${tag}" with this level: "${level}"`, {cause: e})
        }
      }
      else if (levels.length === 2) {
        try {
          const result = semver.inc(tag, levels[0], levels[1])
          if (!result) {
            return new Error(`Semver couldn't increment this tag: "${tag}" with these levels: "${levels[0]}" and "${levels[1]}"`)
          }
          return result
        }
        catch (e) {
          return new Error(`Semver couldn't increment this tag: "${tag}" with these levels: "${levels[0]}" and "${levels[1]}"`, {cause: e})
        }
      }
      else {
        return new Error(`Invalid level.`)
      }
    }

    if (this.scheme === 'calver') {
      const tag = repo.initialRelease ? '' : repo.latestRelevantTag.slice(verPrefixLen)
      const format = this.projectConfiguration.content.versioningFormat

      try {
        return calver.inc(format, tag, level)
      }
      catch (e) {
        return e
      }
    }

    return new Error('Invalid scheme.')
  }

  coerceForNpmVersion(tag) {
    return this.scheme === 'calver' ? semver.valid(semver.coerce(tag)) : tag
  }
}

export default Versioner