const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.addHTMLLink({
      rel: 'stylesheet',
      href: './index.css',
      'data-test': 'link',
      test: 'link',
    })
  }
}

module.exports = Plugin
