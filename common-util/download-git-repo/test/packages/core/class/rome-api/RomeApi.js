/**
 * 通用 api
 */

/**
 * 通用hasPlugin
 */
exports.hasPlugin = function(id) {
  // PluginApi
  if (this.service && !this.generator) {
    return this.service.plugins.some(p => p.id.indexOf(id) >= 0)
  }
  // GeneratorApi
  if (this.generator && !this.service) {
    return this.generator.plugins.some(p => p.id.indexOf(id) >= 0)
  }
  return false
}
