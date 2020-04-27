
const RomeManager = require('../../packages/core/class/rome-manager/index.js')

// const preset1 = require('@nibfe/rome-preset-1')
// console.log('preset1 >', preset1)
// const plugin2 = require('@nibfe/rome-plugin-2')
// console.log('plugin2 >', plugin2)

const { plugins = [], errors = [], projectOptions = {}, vuePlugins = [] } = new RomeManager()
console.log('plugins >', plugins)


