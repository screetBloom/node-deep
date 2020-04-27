const RomeDependence = require('../../rome-dependence/RomeDependence.js')
const { GeneratorAPI } = new RomeDependence()
// 通用Api
const RomeApi = require('../RomeApi.js')

/**
 * 重写的GeneratorAPI类
 */
class romeGeneratorAPI extends GeneratorAPI {
  constructor(...param) {
    super(...param)
  }
}

Object.assign(romeGeneratorAPI.prototype, RomeApi)

module.exports = romeGeneratorAPI
