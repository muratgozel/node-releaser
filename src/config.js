const fs = require('fs')
const path = require('path')
const convict = require('convict')
const pkgjson = require('../package.json')

module.exports = function configure() {
  const config = convict({
    releaser: {
      name: {
        doc: 'The name of the package.',
        format: String,
        default: pkgjson.name
      },
      version: {
        doc: 'The version of the package.',
        format: String,
        default: pkgjson.version
      }
    },
    project: {
      path: {
        doc: 'Project path. Execution path by default.',
        format: String,
        default: process.cwd()
      }
    },
    versioning: {
      scheme: {
        doc: 'Versioning scheme. semver or calver.',
        format: String,
        default: 'semver',
        env: 'RELEASER_VERSIONING_SCHEME'
      },
      format: {
        doc: 'Calver versioning format.',
        format: String,
        default: '',
        env: 'RELEASER_VERSIONING_FORMAT'
      }
    },
    npm: {
      enable: {
        doc: 'Enables npm plugin.',
        format: Boolean,
        default: false,
        env: 'RELEASER_NPM'
      },
      updatePkgJson: {
        doc: 'Updates version number in the package.json file',
        format: Boolean,
        default: false,
        env: 'RELEASER_UPDATE_PKG_JSON'
      },
      publish: {
        doc: 'Publish on npm.',
        format: Boolean,
        default: false,
        env: 'RELEASER_NPM_PUBLISH'
      }
    },
    github: {
      enable: {
        doc: 'Enables github plugin.',
        format: Boolean,
        default: false,
        env: 'RELEASER_GITHUB'
      },
      release: {
        doc: 'Make a release on github.',
        format: Boolean,
        default: false,
        env: 'RELEASER_GITHUB_RELEASE'
      },
      token: {
        doc: 'Github personel access token.',
        format: String,
        default: '',
        env: 'RELEASER_GITHUB_TOKEN'
      }
    }
  })

  // load user config
  const userconf = path.join(config.get('project.path'), '.releaser.json')
  if (fs.existsSync(userconf)) {
    config.loadFile(userconf)
  }

  config.validate({allowed: 'strict'})

  return config
}
