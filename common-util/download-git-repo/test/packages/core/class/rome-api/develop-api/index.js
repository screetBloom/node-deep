const RomeDependence = require('../../rome-dependence/RomeDependence.js')
const { PluginAPI } = new RomeDependence()
// 通用Api
const RomeApi = require('../RomeApi.js')

/**
 * 重写的PluginAPI类
 */
class romePluginAPI extends PluginAPI {
  constructor(...param) {
    super(...param)
  }
  addEntryImportsAhead(opts) {
    this.service.addEntryImportsAheadOptions.push(opts)
  }
  addEntryCodeAhead(opts) {
    this.service.addEntryCodeAheadOptions.push(opts)
  }
  replaceFileOptions(opts) {
    this.service.replaceFileOptions.push(opts)
  }
  addHTMLTag(options) {
    this.service.addHTMLTag(options)
  }

  addHTMLMeta(options) {
    this.service.addHTMLMeta(options)
  }

  addHTMLLink(options) {
    this.service.addHTMLLink(options)
  }

  addHTMLStyle(options) {
    this.service.addHTMLStyle(options)
  }

  addHTMLHeadScript(options) {
    this.service.addHTMLHeadScript(options)
  }

  addHTMLBodyScript(options) {
    this.service.addHTMLBodyScript(options)
  }
}

Object.assign(romePluginAPI.prototype, RomeApi)

module.exports = romePluginAPI
