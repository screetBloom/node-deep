'use strict'

const pluginName = 'AutoInjectPlugin'

class AutoInjectPlugin {
  constructor(options) {
    this.options = options
  }

  generate() {
    console.log('generate ~')
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      try {
        this.generate()
      } catch (error) {
        compilation.errors.push(error)
      }
    })
  }
}

module.exports = AutoInjectPlugin
