/**
 * Rome整体启动函数, 对标Vue CLI的整体Service
 */
const {
  resolveModule,
  romeRequire,
  whatType,
  function2Str,
  // 常量定义
  ABSOLUTE_PLUGIN_INDEX_PATH,
  ABSOLUTE_PLUGIN_GENERATOR_PATH,
  ABSOLUTE_DEFAULT_GENERATOR_PATH,
  NPM_PLUGIN_REG,
  // 常量: 会触发generator模块的指令
  GENERATOR_TRIGGER,
} = require('../../src/lib/util')
const RomeManager = require('../rome-manager/index')
const { warn, error, chalk } = require('@vue/cli-shared-utils')
const path = require('path')
const GeneratorService = require('./GeneratorService')
const DevelopService = require('./DevelopService')

// 常量定义: npm中和js文件中路径常量
const PLUGIN_INDEX_PATH = `./${ABSOLUTE_PLUGIN_INDEX_PATH}`
const PLUGIN_GENERATOR_PATH = `./${ABSOLUTE_PLUGIN_GENERATOR_PATH}`
const DEFAULT_GENERATOR_PATH = `./${ABSOLUTE_DEFAULT_GENERATOR_PATH}`
// rome内置插件
const htmlInjection = require('../../src/plugins/htmlInjection.js')
const inject = require('../../src/plugins/inject.js')
const romeInnerPlugins = [
  {
    name: 'htmlInjection',
    id: 'rome-built-in:config/htmlInjection',
    apply: htmlInjection,
    isRomePlugin: {},
  },
  {
    name: 'inject',
    id: 'rome-built-in:config/inject',
    apply: inject,
    isRomePlugin: {},
  },
]

class RomeService {
  constructor(cwd = process.cwd(), testPlugins = []) {
    // 运行时上下文对应的path
    this.context = cwd
    // romeManager产出的配置信息
    this.managerOptions = {}
    // 获取RomeManager的产物
    this.plugins = this.preProcess()
  }

  /**
   * 生命周期函数: todo
   * */
  beforeInstall() {}

  /**
   * 生命周期函数: todo
   * */
  afterInstall() {}

  /**
   * 处理原始插件数组参数, 便于运行时自定义参数挂载
   * @param {Array} plugins
   */
  _pluginOptions(plugins = []) {
    let tree = {}
    const arr = JSON.parse(JSON.stringify(plugins))
    arr.forEach(plugin => {
      const key = plugin.name
      delete plugin.name
      delete plugin.path
      tree[key] = plugin
    })
    return tree
  }

  /**
   * romeManager输出的errors进行提示
   * 返回romeManager预处理的插件集
   */
  preProcess() {
    const { plugins = [], errors = [], projectOptions = {}, vuePlugins = [] } = new RomeManager({
      dir: this.context.cwd,
    })
    projectOptions._romePluginOptions = this._pluginOptions(plugins)
    // 避免javascript class实现层的bug,注入识别标志
    plugins.forEach(i => {
      i.isRomePlugin = {}
    })
    this.managerOptions = projectOptions
    if (errors.length > 0) {
      const errorStr = errors.reduce((sum, cur) => sum + cur.name + ',', '')
      console.log(
        `${chalk.bgYellow.black(' WARN ')}${errorStr}\n${chalk.yellow(
          `上述插件不符合研发框架插件的规范, 运行时已经自动剔除\n`,
        )}${chalk.yellow(`详情规范请查看wiki: https://km.sankuai.com/page/263655242 ～`)}
        `,
      )
    }
    return plugins.concat(vuePlugins) || []
  }

  /**
   * 判断插件是不是npm形式的插件
   * @param {str} pluginPath: 插件path
   */
  _isNpm(pluginPath) {
    return NPM_PLUGIN_REG.test(pluginPath)
  }

  /**
   *
   * @param {*} originPath: 模块原始引用路径, npm为包名
   * @param {*} moduleType: 模块类型
   */
  _requireModule(originPath, moduleType) {
    const isNpmPkg = this._isNpm(originPath)
    const pathMap = {
      [ABSOLUTE_PLUGIN_INDEX_PATH]: !isNpmPkg
        ? PLUGIN_INDEX_PATH
        : `${originPath}/${ABSOLUTE_PLUGIN_INDEX_PATH}`,
      [ABSOLUTE_PLUGIN_GENERATOR_PATH]: !isNpmPkg
        ? PLUGIN_GENERATOR_PATH
        : `${originPath}/${ABSOLUTE_PLUGIN_GENERATOR_PATH}`,
      [ABSOLUTE_DEFAULT_GENERATOR_PATH]: !isNpmPkg
        ? DEFAULT_GENERATOR_PATH
        : `${originPath}/${ABSOLUTE_DEFAULT_GENERATOR_PATH}`,
    }
    return romeRequire(pathMap[moduleType], !isNpmPkg ? originPath : this.context, true)
  }

  /**
   * @param {*} originPath: 模块原始引用路径, npm为包名
   * 如果 generator/index.js存在则返回PLUGIN_GENERATOR_PATH
   * 如果 generator.js存在则返回DEFAULT_GENERATOR_PATH
   */
  _generatorIsExist(originPath) {
    let generatorIsExist = resolveModule(PLUGIN_GENERATOR_PATH, originPath)
    let defaultGeneratorIsExist = resolveModule(DEFAULT_GENERATOR_PATH, originPath)
    if (this._isNpm(originPath)) {
      generatorIsExist = resolveModule(
        `${originPath}/${ABSOLUTE_PLUGIN_GENERATOR_PATH}`,
        this.context,
      )
      defaultGeneratorIsExist = resolveModule(
        `${originPath}/${ABSOLUTE_DEFAULT_GENERATOR_PATH}`,
        this.context,
      )
    }
    return generatorIsExist
      ? PLUGIN_GENERATOR_PATH
      : defaultGeneratorIsExist
      ? DEFAULT_GENERATOR_PATH
      : ''
  }

  /**
   * @param {*} originPath: 模块原始引用路径, npm为包名
   * 如果 index.js存在则返回true
   */
  _serviceIsExist(originPath) {
    let serviceIsExist = resolveModule(PLUGIN_INDEX_PATH, originPath)
    if (this._isNpm(originPath)) {
      serviceIsExist = resolveModule(`${originPath}/${ABSOLUTE_PLUGIN_INDEX_PATH}`, this.context)
    }
    return serviceIsExist ? true : false
  }

  /**
   * @param {Object} abstractPlugin
   * rome 插件:
   *  - 插件是否有代表service能力的PLUGIN_INDEX_PATH
   *  - 插件是否都有install启动函数
   *  - 未安装的npm进行安装: todo
   */
  _analyzeRomePlugins(abstractPlugin) {
    if (!abstractPlugin.path) {
      error(`配置中的${abstractPlugin.name}插件无path属性`)
      return false
    }
    // 尝试加载模块中的service
    const serviceIsExist = this._serviceIsExist(abstractPlugin.path)
    // 尝试加载模块中的generator
    const generatorIsExist = this._generatorIsExist(abstractPlugin.path)
    if (!serviceIsExist) {
      error(`${abstractPlugin.name}插件根目录下必须要包含${PLUGIN_INDEX_PATH} !`)
      return false
    }
    if (!serviceIsExist && !generatorIsExist) {
      error(`${abstractPlugin.name}是一个空插件!`)
      return false
    }
    // 加载对应模块但是不执行，防止多次执行导致的问题
    const serviceModule = this._requireModule(abstractPlugin.path, ABSOLUTE_PLUGIN_INDEX_PATH)
    const generatorModule = this._requireModule(abstractPlugin.path, ABSOLUTE_PLUGIN_GENERATOR_PATH)
    const serviceModuleStr = function2Str(serviceModule)
    const generatorModuleStr = function2Str(generatorModule)
    if (!/install\(\)/g.test(serviceModuleStr)) {
      error(`${abstractPlugin.name}插件${PLUGIN_INDEX_PATH}未包含install启动函数!`)
      return false
    }
    if (!!generatorIsExist && !/install\(\)/g.test(generatorModuleStr)) {
      error(`${abstractPlugin.name}插件${PLUGIN_GENERATOR_PATH}未包含install启动函数!`)
      return false
    }
    return true
  }

  /**
   * @param {Object} abstractPlugin
   * Vue CLI插件
   *   - 插件是否有代表service能力的PLUGIN_INDEX_PATH
   *   - 插件是否有代表generator能力目录
   */
  _analyzeVuePlugins(abstractPlugin) {
    // TODO
    return true
  }

  /**
   * pluginAnalysis: 插件集分析, 不符合分析条件的return false
   * rome 插件:
   *  - 插件是否有代表service能力的PLUGIN_INDEX_PATH
   *  - 插件是否都有install启动函数
   *  - 未安装的npm进行安装: todo
   * */
  analyzePlugins(plugins = []) {
    // 保证所有插件的错误信息都能够被输出
    let res = true
    for (let i = 0; i < plugins.length; i++) {
      const abstractPlugin = plugins[i]
      if (abstractPlugin.isRomePlugin) {
        res = this._analyzeRomePlugins(abstractPlugin)
      } else {
        // 分析Vue CLI插件
        res = this._analyzeVuePlugins(abstractPlugin)
      }
    }
    return res
  }

  /**
   * 内部功能函数: 插件分类，产出的插件供消费者使用
   * 顺便将研发框架定义的结构调整成vue cli需要的结构
   */
  _sortPlugins(plugins = []) {
    let generatorPlugins = []
    let servicePlugins = []
    // 外部插件
    for (let i = 0; i < plugins.length; i++) {
      const abstractPlugin = JSON.parse(JSON.stringify(plugins[i]))
      // 根据能力进行分类
      servicePlugins.push(
        Object.assign({}, abstractPlugin, {
          id: abstractPlugin.name,
          apply: this._requireModule(abstractPlugin.path, ABSOLUTE_PLUGIN_INDEX_PATH),
          path: path.join(this.context, abstractPlugin.path),
        }),
      )
      // 判断是否存在generator
      let generatorIsExist = this._generatorIsExist(abstractPlugin.path)
      if (generatorIsExist === PLUGIN_GENERATOR_PATH) {
        generatorPlugins.push(
          Object.assign({}, abstractPlugin, {
            id: abstractPlugin.name,
            apply: this._requireModule(abstractPlugin.path, ABSOLUTE_PLUGIN_GENERATOR_PATH),
            path: path.join(this.context, abstractPlugin.path),
          }),
        )
      } else if (generatorIsExist === DEFAULT_GENERATOR_PATH) {
        generatorPlugins.push(
          Object.assign({}, abstractPlugin, {
            id: abstractPlugin.name,
            apply: this._requireModule(abstractPlugin.path, ABSOLUTE_DEFAULT_GENERATOR_PATH),
            path: path.join(this.context, abstractPlugin.path),
          }),
        )
      }
    }
    // 内部插件
    romeInnerPlugins.forEach(i => {
      if (/^rome-built-in\:config/.test(i.id)) {
        servicePlugins.push(i)
      }
    })
    return { generatorPlugins, servicePlugins }
  }

  /**
   * 消费Rome插件, 前置插件分析已经结束，默认这里都是正常插件
   * */
  async consumePlugins(plugins = [], options) {
    const { generatorPlugins, servicePlugins } = this._sortPlugins(plugins)
    // 根据匹配到的执行command判断是否要执行service或者generator功能
    // TODO: 和cli关系抽离
    const command = options.name
    const triggerFlag = GENERATOR_TRIGGER.indexOf(command) >= 0
    if (triggerFlag) {
      // 执行generator插件集
      const generatorService = new GeneratorService(
        [].concat(generatorPlugins),
        this.context,
        options,
        this.managerOptions,
      )
      await generatorService.run()
    } else {
      // 执行service插件
      const developService = new DevelopService(
        [].concat(servicePlugins),
        this.context,
        options,
        this.managerOptions,
      )
      await developService.run()
    }
  }

  /**
   * service的启动入口
   */
  async run(name, args = {}, rawArgv = []) {
    console.log(`🎨   ${chalk.green('Rome启动～')}`)
    // RomeManager产出的插件集
    const plugins = this.plugins
    // 分析插件集
    const analysisRes = this.analyzePlugins(plugins)
    if (!analysisRes) {
      return false
    }
    console.log(`🛠   ${chalk.green('预处理后的插件集通过了插件分析～')}`)
    // 消费插件集
    await this.consumePlugins(plugins, { name, args, rawArgv })
    // console.log(`👑   ${chalk.green('执行结束～')}`)
  }
}

module.exports = RomeService
