const fs = require('fs')
const path = require('path')
const process = require('process')
const defaultsDeep = require('lodash.defaultsdeep')
const { isPlugin, warn } = require('@vue/cli-shared-utils')
const { defaults, validate } = require('./options.js')
const RomeDependence = require('../rome-dependence/RomeDependence.js')
const {
  romeRequire,
} = require('../../src/lib/util')

const { getPkg } = new RomeDependence()

module.exports = class RomeManager {
  constructor(options = {}) {
    const {
      dir = process.cwd(),
      singleFilePath = './rome-plugins/',
      romeNamespace = 'rome',
      configFile = 'vue.config.js',
      inlineOptions
    } = options

    this.pkg = {}
    try {
      this.pkg = getPkg(dir)
    } catch (e) {
      this.pkg = {}
    }
    // 运行时引用域
    this.context = dir
    this.romeNamespace = romeNamespace
    this.inlineOptions = inlineOptions
    this.configFile = configFile
    this.configPath = path.join(dir, this.configFile)

    // TODO: 类似 npm 包 scope、单文件形式目录这种配置抽出来维护一份，给各个模块（类）
    this.scope = '@nibfe'
    this.singleFilePath = singleFilePath
    this.prefix = 'rome-'

    this.rawPlugins = []
    this.plugins = []
    this.errors = []

    this.vuePlugins = []
    this.vueOptions = null

    const userOptions = this.loadUserOptions()
    this.projectOptions = defaultsDeep(userOptions, defaults())
    this.findPlugins()

    this.loadVuePlugins()
  }

  validateConfig(config) {
    try {
      if (typeof config === 'function') {
        config = config()
      }
      if (!config || typeof config !== 'object') {
        throw new Error('should export an object or a function that returns object.')
      }
    } catch (e) {
      console.error(`Error loading ${this.configFile}: ${e}`)
      config = this.inlineOptions || {}
    }

    return config
  }

  ensureSlash(config, key) {
    const val = config[key]
    if (typeof val === 'string') {
      config[key] = val.replace(/([^/])$/, '$1/')
    }
  }
  
  removeSlash(config, key) {
    if (typeof config[key] === 'string') {
      config[key] = config[key].replace(/\/$/g, '')
    }
  }

  loadUserOptions() {
    // ensure config file exists
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`${this.configFile} 配置不存在：${this.configPath}`)
    }
    // get config
    let config = require(this.configPath)
    config = this.validateConfig(config)

    if (config.css && typeof config.css.modules !== 'undefined') {
      if (typeof config.css.requireModuleExtension !== 'undefined') {
        console.warn(
          `You have set both "css.modules" and "css.requireModuleExtension" in ${this.configFile}, ` +
          `"css.modules" will be ignored in favor of "css.requireModuleExtension".`
        )
      } else {
        console.warn(
          `"css.modules" option in ${this.configFile} ` +
          `is deprecated now, please use "css.requireModuleExtension" instead.`
        )
        config.css.requireModuleExtension = !config.css.modules
      }
    }

    this.ensureSlash(config, 'publicPath')
    if (typeof config.publicPath === 'string') {
      config.publicPath = config.publicPath.replace(/^\.\//, '')
    }
    this.removeSlash(config, 'outputDir')

    delete config.baseUrl

    validate(config, msg => {
      console.error(`Invalid options in ${this.configFile}: ${msg}`)
    })

    return config
  }

  getPluginsInPreset(presetName) {
    const prefix = `${this.scope}/${this.prefix}`
    // validate name
    const reg = new RegExp(`^(${prefix})?preset-`)
    if (!reg.test(presetName)) {
      this.errors.push({
        _type: 'preset',
        name: presetName
      })
      warn(`Preset 名称校验未通过：${presetName}, 命名规范请参考使用 FAQ：https://km.sankuai.com/page/288463332`)
      return []
    }
    // short name
    if (!presetName.startsWith(prefix)) {
      presetName = `${prefix}${presetName}`
    }
    let plugins
    try {
      plugins = romeRequire(presetName, this.context)
    } catch (e) {
      console.log(e)
      return []
    }

    return plugins
  }

  findPlugin(pluginConfig) {
    if (typeof pluginConfig === 'string' || pluginConfig instanceof String) {
      pluginConfig = {
        name: pluginConfig,
      }
    }

    pluginConfig = {
      ...this.projectOptions.pluginOptions,
      ...pluginConfig,
    }

    // validate name
    const validated = this.validatePlugin(pluginConfig.name)
    if (!validated) {
      this.errors.push(pluginConfig)
      warn(`插件名称校验未通过：${pluginConfig.name}, 命名规范请参考使用 FAQ：https://km.sankuai.com/page/288463332`)
      return null
    }

    // set pluginConfig.path
    if (pluginConfig.name.startsWith(this.scope)) {
      pluginConfig.path = pluginConfig.name
    } else {
      pluginConfig.path = `${this.singleFilePath}${pluginConfig.name}`
    }

    return pluginConfig
  }

  handleSameName(plugins) {
    for (let idx = 0; idx < plugins.length; idx += 1) {
      const name = plugins[idx].name
      while (plugins.filter(plugin => plugin.name === name).length > 1) {
        const removeIdx = plugins.findIndex(plugin => plugin.name === name)
        plugins.splice(removeIdx, 1)
      }
    }
  }

  /**
   * 同时存在Vue CLI和Rome CLI时, rome的配置项会被schema校验住
   * 这里做一下兼容
   *  - 默认模式: 优先读取 vue.config.js rome字段
   *  - 兼容模式: 不配置rome字段，读取 vue.config.js pluginOptions.rome字段
   */
  _getPluginsInVueConfigJs() {
    let romeConfig = this.projectOptions[this.romeNamespace]
    const { presets = [], plugins = [] } = romeConfig
    if (presets.length === 0 && plugins.length === 0) {
      const pluginOptions = this.projectOptions.pluginOptions || {}
      romeConfig = pluginOptions[this.romeNamespace] || {}
      // 删除rome在 projectOptions.pluginOptions 中的配置, 防止参数继续传递
      if (this.projectOptions && this.projectOptions.pluginOptions) {
        delete this.projectOptions.pluginOptions[this.romeNamespace]
      }
    }
    return romeConfig || {}
  }

  findPlugins() {
    let { presets = [], plugins = [] } = this._getPluginsInVueConfigJs()
    // step1: load each preset as plugins
    let loadedPlugins = []
    presets.forEach(preset => {
      this.rawPlugins = this.rawPlugins.concat(this.getPluginsInPreset(preset))
    })

    // step2: save row plugins in presets
    this.rawPlugins = this.rawPlugins.concat(loadedPlugins)

    // step3: save raw plugins
    this.rawPlugins = this.rawPlugins.concat(plugins)

    // step4: pack plugins
    this.plugins = this.rawPlugins
      .map(pluginConfig => this.findPlugin(pluginConfig))
      .filter(plugin => !!plugin && plugin.enable !== false)

    // step5: remove same plugins
    this.handleSameName(this.plugins)
    
    this.projectOptions[this.romeNamespace] = {
      plugins: this.plugins,
    }
  }

  validatePlugin(name = '') {
    // @nibfe/rome-plugin-${xxx} or rome-plugin-${xxx}
    return new RegExp(`^(${this.scope}/)?${this.prefix}plugin-`).test(name)
  }

  loadVuePlugins() {
    this.vuePlugins = Object.keys(this.pkg.devDependencies || {})
      .concat(Object.keys(this.pkg.dependencies || {}))
      .filter(isPlugin)
      .map(plugin => {
        return {
          ...this.projectOptions.pluginOptions,
          name: plugin,
          path: plugin,
        }
      })
    
    this.handleSameName(this.vuePlugins)
  }
}
