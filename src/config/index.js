const fs = require('fs')
const path = require('path')
const convict = require('convict')
const schema = require('./schema')

module.exports = function configure() {
  const config = convict(schema)

  // load user config
  const userconf = path.join(config.get('project.path'), '.releaser.json')
  if (fs.existsSync(userconf)) {
    config.loadFile(userconf)
  }

  //config.validate({allowed: 'strict'})

  return config
}
