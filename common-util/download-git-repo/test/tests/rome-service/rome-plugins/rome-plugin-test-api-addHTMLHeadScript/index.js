const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.addHTMLHeadScript('console.log("addHTMLHeadScript success")')
  }
}

module.exports = Plugin
