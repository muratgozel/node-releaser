const fs = require('fs')
const path = require('path')
const {execSync} = require('child_process')

function npm() {
  const store = {
    filepath: null,
    obj: null
  }

  function initiated(config) {
    if (!config.get('npm.updatePkgJson')) return

    store.filepath = path.join(config.get('project.path'), 'package.json')
    if (fs.existsSync(store.filepath)) {
      store.obj = JSON.parse( fs.readFileSync(store.filepath, 'utf8') )
    }
  }

  function beforePush(nextTag) {
    updatePkgJson('version', nextTag)
  }

  function afterPush(config) {
    if (!config.get('npm.publish')) return

    try {
      execSync('npm publish --access public', {stdio: 'inherit', encoding: 'utf8'})
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
