exports.hasPlugin = function(id) {
  // PluginApi
  if (this.service && !this.generator) {
    return this.service.plugins.some(p => p.id === id)
  }
  // GeneratorApi
  if (this.generator && !this.service) {
    return this.generator.plugins.some(p => p.id === id)
  }
  return `my name is ${this.name}`
}

exports.say = function(id) {
  console.log(`say ${id}`)
}
