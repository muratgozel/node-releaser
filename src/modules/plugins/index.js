const path = require('path')
const colors = require('colors/safe')
const configSchema = require('../../config/schema')

function plugins() {
  const store = {
    ctx: {},
    list: []
  }

  function updateContext(prop, value) {
    store.ctx[prop] = value
  }

  function registerUserPlugins(config) {
    const configobj = config.getProperties()
    const initialConfigProps = Object.keys(configSchema)

    Object
      .keys(configobj)
      .filter(prop => initialConfigProps.indexOf(prop) === -1)
      .map(function(plugin) {
        if (config.get(plugin + '.enable')) {
          console.log(colors.blue('Activating user plugin ' + plugin))
          const pluginpath = path.join(config.get('project.path'), config.get(plugin + '.path'))
          register(require(pluginpath))
        }
      })
  }

  function registerDefaultPlugins(config) {
    if (config.get('npm.enable')) {
      register(require('../../plugins/npm'))
    }

    if (config.get('github.enable')) {
      register(require('../../plugins/github'))
    }

    if (config.get('gitlab.enable')) {
      register(require('../../plugins/gitlab'))
    }

    if (config.get('docker.enable')) {
      register(require('../../plugins/docker'))
    }

    if (config.get('cmd.enable')) {
      register(require('../../plugins/cmd'))
    }
  }

  function register(plugin) {
    const reqprops = ['initiated', 'beforePush', 'afterPush']
    reqprops.map(function(prop) {
      if (!plugin.hasOwnProperty(prop)) {
        throw new Error('Plugin has missing method "' + prop + '"')
      }
    })

    store.list.push(plugin)
  }

  function call(eventName) {
    const [_eventName, ...rest] = arguments
    return Promise.all(store.list.map(
      async (plugin) => {
        return await plugin[eventName].apply(store.ctx, rest)
      }
    ))
  }

  function getContext() {
    return store.ctx
  }

  return {
    call,
    register,
    registerDefaultPlugins,
    registerUserPlugins,
    updateContext,
    getContext
  }
}

module.exports = plugins()
