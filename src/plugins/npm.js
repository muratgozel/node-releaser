const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')
const semver = require('semver')

function npm() {
  const store = {
    filepath: null,
    obj: null
  }

  async function initiated() {
    if (!this.config.get('npm.updatePkgJson')) return

    store.filepath = path.join(this.config.get('project.path'), 'package.json')
    if (fs.existsSync(store.filepath)) {
      store.obj = JSON.parse( fs.readFileSync(store.filepath, 'utf8') )
    }
  }

  async function beforePush(nextTag) {
    const version = this.config.get('versioning.scheme') === 'calver' ? semver.valid(semver.coerce(nextTag)) : nextTag
    updatePkgJson('version', version)
  }

  async function afterPush() {
    if (!this.config.get('npm.publish')) return

    try {
      const cmd = 'npm publish ' + this.config.get('npm.publishCmdSuffix')
      execSync(cmd, {stdio: 'inherit', encoding: 'utf8'})
    } catch (e) {
      throw e
    }
  }

  function updatePkgJson(prop, value) {
    store.obj[prop] = value

    fs.writeFileSync(store.filepath, JSON.stringify(store.obj, null, 2))
  }

  function hasPkgJson() {
    return fs.existsSync(store.filepath)
  }

  function getPkgJson() {
    return hasPkgJson() ? JSON.parse( fs.readFileSync(store.filepath, 'utf8') ) : {}
  }

  return {
    initiated: initiated,
    beforePush: beforePush,
    afterPush: afterPush,
    hasPkgJson: hasPkgJson,
    getPkgJson: getPkgJson
  }
}

module.exports = npm()
