const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.addHTMLTag({
      target: 'body',
      tag: 'style',
      attrs: {
        'data-test': 'tag',
        test: 'tag',
      },
    })
  }
}

module.exports = Plugin
