const path = require('path')
const RomeDependence = require('../packages/core/class/rome-dependence/RomeDependence.js')
const { GeneratorAPI, PluginAPI } = new RomeDependence({ cwd: path.join(__dirname, '../') })
// console.log('GeneratorAPI >', GeneratorAPI)
// console.log('PluginAPI >', PluginAPI)