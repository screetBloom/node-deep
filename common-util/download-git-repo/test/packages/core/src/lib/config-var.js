/**
 * 跨文件使用的通用变量
 */

exports.ABSOLUTE_PLUGIN_INDEX_PATH = 'index.js'
exports.ABSOLUTE_PLUGIN_GENERATOR_PATH = 'generator/index.js'
exports.ABSOLUTE_DEFAULT_GENERATOR_PATH = 'generator.js'
exports.ABSOLUTE_PLUGIN_PROMPTS_PATH = 'prompts.js'
// npm插件正则
exports.NPM_PLUGIN_REG = /@([\s\S]*)\/(rome-plugin|vue-cli-plugin)/
exports.CREATE_KEY = 'create'
// 会触发generator模块的指令
exports.GENERATOR_TRIGGER = ['add', 'invoke', exports.CREATE_KEY]