const path = require('path')
const colors = require('colors/safe')
const plugins = require('./modules/plugins')
const git = require('./modules/git')
const versioning = require('./modules/versioning')
const configure = require('./config')
const createReleaseByLevelApp = require('./application/createReleaseByLevel')

function lib() {
  const store = {
    ctx: null
  }

  function generateContext() {
    store.ctx = {
      git: git,
      versioning: versioning,
      plugins: plugins,
      config: configure()
    }

    plugins.updateContext('config', store.ctx.config)
    plugins.updateContext('git', store.ctx.git)
    plugins.updateContext('versioning', store.ctx.versioning)
    plugins.updateContext('getBareVersion', function(tag) {
      const prefix = store.ctx.config.get('versioning.prefix')

      if (tag.indexOf(prefix) !== 0) {
        return tag
      }

      return tag.slice(prefix.length)
    })
    plugins.updateContext('prefixTag', function(tagBare) {
      return store.ctx.config.get('versioning.prefix') + tagBare
    })
  }

  function getContext() {
    return store.ctx
  }

  async function createReleaseByLevelCLI(level, argv) {
    const messages = Array.isArray(argv.message) ? argv.message : [argv.message]
    const forceCalverFormat = argv.forceCalverFormat
    const inputCurrentTag = argv.currentTag
    return await createReleaseByLevel(level, {messages, forceCalverFormat, inputCurrentTag})
  }

  async function createReleaseByLevel(level, params) {
    if (!params.messages || (Array.isArray(params.messages) && !params.messages[0])) {
      throw new Error('Missing messages.')
    }
    return await createReleaseByLevelApp(level, Object.assign({}, params, getContext()))
  }

  generateContext()

  return {
    generateContext: generateContext,
    getContext: getContext,
    createReleaseByLevel: createReleaseByLevel,
    createReleaseByLevelCLI: createReleaseByLevelCLI
  }
}

module.exports = lib()
