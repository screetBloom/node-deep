class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    console.log('---- 我是插件3的service, 我被执行拉')
    const api = this.api
    api.addEntryImportsAhead({ source: 'vue', specifier: 'Vue' })
  }
}

module.exports = Plugin
