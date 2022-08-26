const fs = require('fs')
const path = require('path')
const convict = require('convict')
const schema = require('./schema')
const {findServiceProvider} = require('../modules/git')
const {hasPkgJson, getPkgJson} = require('../plugins/npm')

module.exports = function configure() {
  const config = convict(schema)

  // auto-detect github and gitlab repos
  const provider = findServiceProvider()

  if (provider === 'github') {
    config.set('github.enable', true)
    config.set('github.release', true)
  }

  if (provider === 'gitlab') {
    config.set('gitlab.enable', true)
    config.set('gitlab.release', true)
  }

  // auto-detect npm packages
  const hasPackageJson = hasPkgJson()

  if (hasPackageJson) {
    config.set('npm.enable', true)
    config.set('npm.updatePkgJson', true)
  }

  // detect config file
  const configFileReleaser = path.join(config.get('project.path'), 'releaser.json')
  const configFileReleaserOld = path.join(config.get('project.path'), '.releaser.json')
  if (fs.existsSync(configFileReleaser)) {
    // releaser.json first
    config.loadFile(configFileReleaser)
  }
  else if (hasPackageJson && getPkgJson().hasOwnProperty('releaser')) {
    // try package.json
    config.load(getPkgJson().releaser)
  }
  else if (fs.existsSync(configFileReleaserOld)) {
    // .releaser.json for backward compatibility
    config.loadFile(configFileReleaserOld)
  }
  else {}

  // check github/gitlab access token env vars for backward compatibility
  if (config.get('github.enable') && !process.env.RELEASER_GITHUB_TOKEN && process.env.GITHUB_TOKEN) {
    process.env.RELEASER_GITHUB_TOKEN = process.env.GITHUB_TOKEN
    config.set('github.token', process.env.RELEASER_GITHUB_TOKEN)
  }

  if (config.get('gitlab.enable') && !process.env.RELEASER_GITLAB_TOKEN && process.env.GITLAB_TOKEN) {
    process.env.RELEASER_GITLAB_TOKEN = process.env.GITLAB_TOKEN
    config.set('gitlab.token', process.env.RELEASER_GITLAB_TOKEN)
  }

  return config
}
