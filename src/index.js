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
  }

  function init() {
    if (store.ctx.config.get('npm.enable')) {
      store.ctx.plugins.register(require('./plugins/npm'))
    }

    if (store.ctx.config.get('github.enable')) {
      store.ctx.plugins.register(require('./plugins/github'))
    }

    store.ctx.plugins.call('initiated', store.ctx.config, store.ctx.git)
  }

  function getContext() {
    return store.ctx
  }

  function createReleaseByLevelCLI(level, argv) {
    const messages = Array.isArray(argv.message) ? argv.message : [argv.message]
    return createReleaseByLevel(level, {messages})
  }

  function createReleaseByLevel(level, params) {
    if (!params.messages || (Array.isArray(params.messages) && !params.messages[0])) {
      throw new Error('Missing messages.')
    }
    return createReleaseByLevelApp(level, Object.assign({}, params, getContext()))
  }

  generateContext()
  init()

  return {
    generateContext: generateContext,
    init: init,
    getContext: getContext,
    createReleaseByLevel: createReleaseByLevel,
    createReleaseByLevelCLI: createReleaseByLevelCLI
  }
}

module.exports = lib()
