const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.addHTMLMeta({
      name: 'viewport',
      content: 'initial-scale=1.0',
      'data-test': 'meta',
      test: 'meta',
    })
  }
}

module.exports = Plugin
