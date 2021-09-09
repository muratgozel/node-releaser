function plugins() {
  const store = {
    list: []
  }

  function register(plugin) {
    const reqprops = ['beforePush', 'afterPush']
    reqprops.map(function(prop) {
      if (!plugin.hasOwnProperty(prop)) {
        throw new Error('Plugin has missing method "' + prop + '"')
      }
    })

    store.list.push(plugin)
  }

  function call(eventName) {
    const [_eventName, ...rest] = arguments
    store.list.map(plugin => plugin[eventName].apply(null, rest))
  }

  return {
    call: call,
    register: register
  }
}

module.exports = plugins()
