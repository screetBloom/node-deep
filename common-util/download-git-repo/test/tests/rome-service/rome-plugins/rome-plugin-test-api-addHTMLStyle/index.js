const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.addHTMLStyle({
      'data-test': 'style',
      test: 'style',
      content: `p {
        color: #07080f;
      }`,
    })
  }
}

module.exports = Plugin
