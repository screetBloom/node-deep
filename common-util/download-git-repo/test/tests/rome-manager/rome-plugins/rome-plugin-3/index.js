class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    const api = this.api
    api.addEntryImportsAhead({ source: 'vue', specifier: 'Vue' })
  }
}

module.exports = Plugin
