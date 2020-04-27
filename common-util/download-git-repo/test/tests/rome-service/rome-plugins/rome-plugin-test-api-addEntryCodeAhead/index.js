const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    const codeStr1 = 'window.alert("addEntryCodeAhead success")'
    this.api.addEntryCodeAhead(codeStr1)
    const codeStr2 = 'if(Vue){window.alert("vue has import")}'
    this.api.addEntryCodeAhead(codeStr2)
    this.api.configureWebpack(config => {
      config.entry = {
        index: path.resolve(__dirname, '../../src/pages/demo/main.js'),
        app: path.resolve(__dirname, '../../src/main.js'),
      }
    })
  }
}

module.exports = Plugin
