const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.addHTMLBodyScript('console.log("addHTMLBodyScript success")')
  }
}

module.exports = Plugin
