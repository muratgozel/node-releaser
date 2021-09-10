# node-releaser
Automated semantic and calendar versioning tool with plugin support.

![NPM](https://img.shields.io/npm/l/node-releaser)
[![npm version](https://badge.fury.io/js/node-releaser.svg)](https://badge.fury.io/js/node-releaser)
![npm bundle size](https://img.shields.io/bundlephobia/min/node-releaser)
![npm](https://img.shields.io/npm/dy/node-releaser)

## Introduction
`releaser` can be used in any environment that runs node.js. It is based on `git` and works either from terminal and node environment. It automates versioning in your projects and automates pushing codebase changes to the remote version control services such as **Github** and **Gitlab**. It is also extendable through plugins. (see `src/plugins` folder).

**Features overview:**
1. Based on git.
2. Powerful configuration management. (thanks to [convict](https://github.com/mozilla/node-convict/tree/master/packages/convict))
3. Supports both [semver](https://github.com/npm/node-semver) and [calver](https://github.com/muratgozel/node-calver) while versioning.
4. Supports prefixing version numbers.
5. Generates changelog based on git commit messages.
6. npm, github and gitlab plugins. See configuration reference below.

## Install
As a cli tool, it is recommended to install it globally:
```sh
npm i -g node-releaser
```

## Usage (CLI)
Make sure `releaser` is available:
```sh
releaser --version
```
Look at available commands:
```sh
releaser <cmd> [args]

Commands:
  releaser major           Creates a major release
  releaser minor           Creates a minor release
  releaser patch           Creates a patch release
  releaser premajor        Creates a premajor release. (semver)
  releaser preminor        Creates a preminor release. (semver)
  releaser prepatch        Creates a prepatch release. (semver)
  releaser prerelease      Creates a prerelease release. (semver)
  releaser calendar        Creates a calendar release. (calver)
  releaser micro           Creates a micro release. (calver)
  releaser dev             Creates a dev release. (calver)
  releaser alpha           Creates an alpha release. (calver)
  releaser beta            Creates a beta release. (calver)
  releaser rc              Creates an rc release. (calver)
  releaser calendar.major  Creates a calendar or major release. (calver)
  releaser calendar.minor  Creates a calendar or minor release. (calver)
  releaser calendar.micro  Creates a calendar or micro release. (calver)
  releaser calendar.dev    Creates a calendar or dev release. (calver)
  releaser calendar.alpha  Creates a calendar or alpha release. (calver)
  releaser calendar.beta   Creates a calendar or beta release. (calver)
  releaser calendar.rc     Creates a calendar or rc release. (calver)

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```
First argument is basically the level for the next version. Depending on the versioning scheme you chose, the level should be compatible with the scheme (semver or calver).

Make a release:
```sh
releaser beta -m "initial release."
```
This will create the next version number and push the changes to the remote repository without any plugins.

You can specify multiple messages:
```sh
releaser minor -m "fixed something" -m "added something."
```

## Configuration Loading
There are 3 ways to load your config in releaser. Before going into that take a look at the [configuration schema](https://github.com/muratgozel/node-releaser/blob/main/src/config/schema.js). According to this schema, you can load your config by:
1. Creating **.releaser.json** file
2. Environment variables
3. Command line arguments.

An example configuration which
1. publishes a package on npm
2. updates the version field of the package.json file
3. creates a release on github

can be achieved in one of the following three ways:
1. Creating **.releaser.json** file:
```json
{
  "npm": {
    "enable": true,
    "updatePkgJson": true,
    "publish": true
  },
  "github": {
    "enable": true,
    "release": true,
    "token": "GITHUB_PERSONAL_ACCESS_TOKEN"
  }
}
```
2. Environment variables:
```sh
RELEASER_GITHUB_TOKEN=token RELEASER_GITHUB_ENABLE=true RELEASER_GITHUB_RELEASE=true RELEASER_NPM_ENABLE=true RELEASER_NPM_UPDATEPKGJSON=true RELEASER_NPM_PUBLISH=true releaser patch "something."
```
3. Command line arguments.
```sh
releaser patch "something." --github-token token --github-enable --github-release --npm-enable --npm-updatepkgjson --npm-publish
```
You can even mix them up:
```sh
RELEASER_GITHUB_TOKEN=token releaser patch "something." --github-enable --github-release
# and npm parameters inside .releaser.json file.
```

## Plugins
A template for the plugin:
```js
function myplugin() {
  async function initiated() {
    // triggered when config is ready
  }

  async function beforePush(nextTag) {
    // triggered when the next version computed
  }

  async function afterPush(tag) {
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
This is a minimal setup. All methods have the same special context which is available with `this`:
```js
async function beforePush(nextTag) {
  // triggered when the next version computed

  // context:
  console.log(
    this.config,
    this.git,
    this.versioning,
    this.getBareVersion,
    this.prefixTag
  )
}
```
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

## Context Functions
1. `config` is an instance of `convict` object. It basically has a `get` method to read configuration values. More methods also available. Refer to the documentation of `convict`.
2. `git` has simple functions to read repository configuration and data. Refer to its [source code](https://github.com/muratgozel/node-releaser/blob/main/src/modules/git/index.js) for more information.
3. `versioning` has methods related to versioning schemes calver and semver. Refer to its [source code](https://github.com/muratgozel/node-releaser/blob/main/src/modules/versioning/index.js) for more information.
4. `getBareVersion` removes the version prefix from the supplied tag. `getBareVersion("v1.23") == "1.23"` (Assuming "v" is the prefix)
5. `prefixTag` adds prefix to the supplied tag. `prefixTag("1.23") == "v1.23"` (Assuming "v" is the prefix)

---

Thanks for watching 🐬

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F1RFO7)
