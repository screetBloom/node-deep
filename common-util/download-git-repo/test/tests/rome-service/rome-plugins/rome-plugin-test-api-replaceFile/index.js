const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.chainWebpack(config => {})
    this.api.configureWebpack(config => {
      config.entry = {
        index: path.resolve(__dirname, '../../src/pages/demo/main.js'),
      }
    })
  }
}

module.exports = Plugin
