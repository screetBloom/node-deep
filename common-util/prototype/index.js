const common = require('./common.js')

/**
 * 重写的GeneratorAPI类
 */
class romeGeneratorAPI {
  constructor() {
    this.name = 'romeGeneratorAPI'
  }

  rewrite() {
    console.log(' GeneratorAPI的重写、增量、删除函数～')
  }
}

Object.assign(romeGeneratorAPI.prototype, common)

const instance = new romeGeneratorAPI()
console.log(instance.hasPlugin())
console.log(instance.say(22))
