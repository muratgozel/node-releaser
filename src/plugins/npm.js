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
    updatePkgJson('version', semver.valid(semver.coerce(nextTag)))
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

  return {
    initiated: initiated,
    beforePush: beforePush,
    afterPush: afterPush
  }
}

module.exports = npm()
