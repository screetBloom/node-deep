'use strict'

const pluginName = 'MyPlugin'

class AutoInjectPlugin {
  constructor(options) {
    this.options = options
  }

  generate() {
    console.log('\n')
    console.log('hello little lili ~')
    console.log('\n')
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      try {
        console.log(compilation)
        this.generate()
      } catch (error) {
        compilation.errors.push(error)
      }
    })
  }
}

module.exports = AutoInjectPlugin
