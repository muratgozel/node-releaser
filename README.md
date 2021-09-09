# node-releaser
Automated semantic and calendar versioning tool with plugin support.

## Introduction
`releaser` can be used in any environment that runs node.js. It is based on `git` and works either from terminal and node environment. It automates versioning in your projects and automates pushing codebase changes to the remote services such as **Github** and **Gitlab**. It is extendable through plugins such as npm (see `src/plugins` folder).

## Install
As a cli tool, it is recommended to install it globally:
```sh
npm i -g node-releaser
```

## Configuration File Reference
Create a file called `.releaser.json` in your project directory. It may have the following parameters:
```js
{
  versioning: {
    // versioning scheme: semver or calver
    scheme: 'semver',
    // calver versioning format
    format: 'yy.mm.micro' // calver format
  },

  npm: {
    // enable npm plugin
    enable: false,
    // updates version number in the package.json file
    updatePkgJson: false,
    // also publish on npm.
    publish: false
  },

  github: {
    // enable github plugin
    enable: false,
    // make a release on github
    release: false,
    // github personel access token
    token: ''
  }
}
```
