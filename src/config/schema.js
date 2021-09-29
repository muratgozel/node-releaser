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
    },
    prefix: {
      doc: 'Tag prefix.',
      format: String,
      default: 'v',
      env: 'RELEASER_VERSIONING_PREFIX',
      arg: 'versioning-prefix'
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
    },
    publishCmdSuffix: {
      doc: 'This will be added to the command "npm publish".',
      format: String,
      default: '',
      env: 'RELEASER_NPM_PUBLISHCMDSUFFIX',
      arg: 'npm-publishcmdsuffix'
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
  },
  gitlab: {
    enable: {
      doc: 'Enables gitlab plugin.',
      format: Boolean,
      default: false,
      env: 'RELEASER_GITLAB_ENABLE',
      arg: 'gitlab-enable'
    },
    release: {
      doc: 'Make a release on gitlab.',
      format: Boolean,
      default: false,
      env: 'RELEASER_GITLAB_RELEASE',
      arg: 'gitlab-release'
    },
    token: {
      doc: 'Gitlab personel access token.',
      format: String,
      default: '',
      env: 'RELEASER_GITLAB_TOKEN',
      arg: 'gitlab-token'
    }
  },
  docker: {
    enable: {
      doc: 'Enables docker plugin.',
      format: Boolean,
      default: false,
      env: 'RELEASER_DOCKER_ENABLE',
      arg: 'docker-enable'
    },
    user: {
      doc: 'Docker hub user name.',
      format: String,
      default: '',
      env: 'RELEASER_DOCKER_USER',
      arg: 'docker-user'
    },
    repo: {
      doc: 'The name of the repo on docker hub.',
      format: String,
      default: '',
      env: 'RELEASER_DOCKER_REPO',
      arg: 'docker-repo'
    },
    registry: {
      doc: 'Container registry host. ghcr.io for example. Default is Docker Hub.',
      format: String,
      default: '',
      env: 'RELEASER_DOCKER_REGISTRY',
      arg: 'docker-registry'
    },
    build: {
      path: {
        doc: 'Docker build context.',
        format: String,
        default: '.',
        env: 'RELEASER_DOCKER_BUILD_PATH',
        arg: 'docker-build-path'
      }
    }
  },
  cmd: {
    enable: {
      doc: 'Enables command plugin.',
      format: Boolean,
      default: false,
      env: 'RELEASER_CMD_ENABLE',
      arg: 'cmd-enable'
    },
    beforePush: {
      doc: 'Shell command that runs before pushing changes to the remote.',
      format: String,
      default: '',
      env: 'RELEASER_CMD_BEFOREPUSH',
      arg: 'cmd-beforepush'
    },
    afterPush: {
      doc: 'Shell command that runs after pushing changes to the remote.',
      format: String,
      default: '',
      env: 'RELEASER_CMD_AFTERPUSH',
      arg: 'cmd-afterpush'
    }
  }
}
