const pkgjson = require('../../package.json')

module.exports = {
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
      env: 'RELEASER_VERSIONING_SCHEME',
      arg: 'versioning-scheme'
    },
    format: {
      doc: 'Calver versioning format.',
      format: String,
      default: '',
      env: 'RELEASER_VERSIONING_FORMAT',
      arg: 'versioning-format'
    }
  },
  npm: {
    enable: {
      doc: 'Enables npm plugin.',
      format: Boolean,
      default: false,
      env: 'RELEASER_NPM_ENABLE',
      arg: 'npm-enable'
    },
    updatePkgJson: {
      doc: 'Updates version number in the package.json file',
      format: Boolean,
      default: false,
      env: 'RELEASER_UPDATE_PKG_JSON',
      arg: 'npm-updatepkgjson'
    },
    publish: {
      doc: 'Publish on npm.',
      format: Boolean,
      default: false,
      env: 'RELEASER_NPM_PUBLISH',
      arg: 'npm-publish'
    }
  },
  github: {
    enable: {
      doc: 'Enables github plugin.',
      format: Boolean,
      default: false,
      env: 'RELEASER_GITHUB_ENABLE',
      arg: 'github-enable'
    },
    release: {
      doc: 'Make a release on github.',
      format: Boolean,
      default: false,
      env: 'RELEASER_GITHUB_RELEASE',
      arg: 'github-release'
    },
    token: {
      doc: 'Github personel access token.',
      format: String,
      default: '',
      env: 'RELEASER_GITHUB_TOKEN',
      arg: 'github-token'
    }
  }
}
