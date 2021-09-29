# node-releaser
Automated versioning and package publishing tool. Supports semver and calver. Extendible with plugins.

![NPM](https://img.shields.io/npm/l/node-releaser)
[![npm version](https://badge.fury.io/js/node-releaser.svg)](https://badge.fury.io/js/node-releaser)
![npm bundle size](https://img.shields.io/bundlephobia/min/node-releaser)
![npm](https://img.shields.io/npm/dy/node-releaser)

## Introduction
`releaser` is based on `git` and `node.js`. Any developer who works with `git` can use it to automate releasing and publishing process of any project. Here is a summary of what can be done with releaser:
1. Use [semver](https://github.com/npm/node-semver) or [calver](https://github.com/muratgozel/node-calver) in your project. New versions computed automatically as you release. This feature based on git tags.
2. It works in sync with the remote code repositories. Supported git services are **Github** and **Gitlab** as you can see in the `src/plugins` folder.
3. Automated **npm** package management. New releases automatically be pushed to npm and updates the version field in package.json file.
4. Automated docker image publishing. It builds the image with new version number and `latest` tags and push it to docker hub or any other docker image registry.
5. Powerful configuration management thanks to [convict](https://github.com/mozilla/node-convict/tree/master/packages/convict). Configuration can be load from a file, env vars and cli args at the same time.
6. Extendible through plugins. You can write a changelog plugin for example that pushes commit messages to a changelog file as you release.

## Install
Install it globally:
```sh
npm i -g node-releaser
```

## Usage (CLI)
Make sure `releaser` is available:
```sh
releaser --version
```

### Create A Configuration File (.releaser.json)
First, this is the schema to write valid configuration files:
```js
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
}
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
```
An example `.releaser.json` file could be:
```json
{
  "versioning": {
    "scheme": "semver"
  },
  "npm": {
    "enable": true,
    "updatePkgJson": true,
    "publish": true
  },
  "github": {
    "enable": true,
    "release": true
  }
}
```
This configuration will:
1. Generate the next version according to **semver** scheme,
2. Prefix the version number with **v** (because its by default),
3. Updates package.json's version field (because npm.updatePkgJson enabled),
3. Push the changes to the remote repository (because github.enabled),
4. Creates a release on Github (because github.release),
5. Publishes the package on npm.
We didn't specify `github.token` because we can not put it inside file of course. We will specify it as env var `RELEASER_GITHUB_TOKEN=...` or a cli arg `--github-token`.

### Running releaser
Releaser only need two things in order to run. The level and commit messages. Level is the version level. major, minor etc. in semver or calendar, calendar.major etc. in calver. Commit messages are one or more -m flags that explain the changes in the codebase in that release.

Look at available commands:
```sh
releaser <cmd> [args]

Commands:
  releaser major           [semver, calver] Creates a major release
  releaser minor           [semver, calver] Creates a minor release
  releaser patch           [semver, calver] Creates a patch release
  releaser premajor        [semver] Creates a premajor release.
  releaser preminor        [semver] Creates a preminor release.
  releaser prepatch        [semver] Creates a prepatch release.
  releaser prerelease      [semver] Creates a prerelease release.
  releaser calendar        [calver] Creates a calendar release.
  releaser micro           [calver] Creates a micro release.
  releaser calendar.major  [calver] Creates a calendar or major release.
  releaser calendar.minor  [calver] Creates a calendar or minor release.
  releaser calendar.micro  [calver] Creates a calendar or micro release.
  releaser calendar.dev    [calver] Creates a calendar or dev release.
  releaser calendar.alpha  [calver] Creates a calendar or alpha release.
  releaser calendar.beta   [calver] Creates a calendar or beta release.
  releaser calendar.rc     [calver] Creates a calendar or rc release.
  releaser dev             [calver] Creates a dev release.
  releaser alpha           [calver] Creates an alpha release.
  releaser beta            [calver] Creates a beta release.
  releaser rc              [calver] Creates an rc release.

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

Make a release:
```sh
releaser major -m "initial release."
```

Specify multiple messages:
```sh
releaser minor -m "fixed something" -m "added something."
```

## Default Plugins
1. **Github**: Github plugin is for creating releases on Github.
2. **Gitlab**: Gitlab plugin is for creating releases on Gitlab.
3. **npm**: Npm plugin can keep the version field in package.json up to date and responsible for publishing packages thorugh npm.
4. **Docker**: Docker plugin is for building and pushing docker images to some container registry.
5. **cmd**: Command plugin is for executing shell commands before or after running pushing code changes to the remote.

## Plugin Development
A template for a plugin:
```js
function myplugin() {
  async function initiated() {
    // triggered when config is ready
  }

  async function beforePush(nextTag) {
    // triggered when the next version computed
  }

  async function afterPush(tag, changelog) {
    // triggered when after git push
  }

  return {
    initiated: initiated,
    beforePush: beforePush,
    afterPush: afterPush
  }
}

module.exports = myplugin()
```
This is a minimal setup. All methods have the same special context which is accessible with `this`:
```js
async function beforePush(nextTag) {
  // triggered when the next version computed

  // context:
  console.log(
    // you can access all config props. this.config.get('github.token') for example
    this.config,
    // a function that returns unprefixed version number. Without "v" for example.
    this.getBareVersion,
    // a function that return prefixed version number.
    this.prefixTag,
    // an object which reads repository data and has some methods. refer to src/modules/git
    this.git,
    // an object that has one method which is generateNextTag
    this.versioning
  )
}
```

### Activating Plugin
Enable and specify the path of the plugin in `.releaser.json`:
```json
{
  "myplugin": {
    "enable": true,
    "path": "./devops/releaser-plugins/myplugin.js",
    "someOtherOption": "yes"
  }
}
```
Run the releaser as usual, that's all.

---

Version management of this repository done by [releaser](https://github.com/muratgozel/node-releaser) 🚀

---

Thanks for watching 🐬

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F1RFO7)
