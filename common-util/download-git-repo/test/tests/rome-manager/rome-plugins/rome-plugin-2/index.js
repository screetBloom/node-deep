const scaffold = require('./scaffold')
const path = require('path')

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    this.api.registerCommand('addComponent', async args => {
      const templateDir = path.join(__dirname, './generator/template')
      const targetPath = path.join(process.cwd(), './')
      await scaffold(templateDir, targetPath, {})
    })
  }
}

module.exports = Plugin
