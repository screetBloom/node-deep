/**
 * 对标Vue CLI的Service启动函数
 */
let romePluginAPI = require('../rome-api/develop-api/index')
if (process.env.SELF_TEST) {
  // 自己本地进行侵入式测试时使用
  romePluginAPI = require('@vue/vue-service/lib/PluginAPI')
}
const path = require('path')
const fs = require('fs')
const { warn, error, chalk, resolvePkg } = require('@vue/cli-shared-utils')
const Config = require('webpack-chain')
const merge = require('webpack-merge')
const {
  resolveModule,
  romeRequire,
  whatType,
  ensureSlash,
  removeSlash,
  cloneRuleNames,
} = require('../../src/lib/util')
const RomeDependence = require('../rome-dependence/RomeDependence.js')
const { appConfig, baseConfig, cssConfig, prodConfig, options } = new RomeDependence()
// const { options } = new RomeDependence()
// webpack默认配置和校验
const { defaults, validate } = options
// 合并配置项
const defaultsDeep = require('lodash.defaultsdeep')
const serveCommand = require('../../src/commands/serve.js')
const buildCommand = require('../../src/commands/build.js')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const innerConfigPlugins = [
  { id: 'built-in:command/build', apply: buildCommand },
  { id: 'built-in:command/serve', apply: serveCommand },
  { id: 'built-in:config/base', apply: baseConfig },
  { id: 'built-in:config/css', apply: cssConfig },
  { id: 'built-in:config/prod', apply: prodConfig },
  { id: 'built-in:config/app', apply: appConfig },
]

/**
 * 除了自身功能，也要满足pluginApi对上游类的要求，因此构造函数定义时需要包含pluginApi的能力诉求
 * 后续具体实现时会rome的建设计划分期拆分实现
 */
module.exports = class Service {
  constructor(plugins = [], cwd = process.cwd(), options, userOptions = {}) {
    // 命令配置参数
    this.commandOptions = options
    // manager产出的用户配置信息
    this.userOptions = userOptions
    // 保留初始状态插件集
    this.romePlugins = plugins
    this.plugins = innerConfigPlugins.concat(plugins).filter(plugin => plugin.apply)
    // 运行时上下文对应的path
    this.context = cwd
    // 运行时挂载的指令
    this.commands = {}
    // 运行时项目的配置信息
    this.projectOptions
    // package.json containing the plugins
    this.pkg = resolvePkg(cwd)
    /**
     * webpack相关配置
     */
    // 每项chainable webpack 的配置函数: 注册链式的webpack配置函数，在调用`Api.chainWebpack`时push回调
    // 仅在resolveWebpackConfig时执行回调
    this.webpackChainFns = []
    // 每项raw webpack 的配置函数: 直接更改配置，也可以返回将合并到配置中的对象
    this.webpackRawConfigFns = []
    // 注册开发阶段服务配置的功能
    this.devServerConfigFns = []
    // addEntryImportsAhead配置项
    this.addEntryImportsAheadOptions = []
    // addEntryCodeAhead配置项
    this.addEntryCodeAheadOptions = []
    // replaceFile 配置项
    this.replaceFileOptions = []
    // 注入标签
    this.addedTags = []
    // 解析由插件以module.exports.defaultModes形式提供的每个命令使用的默认模式
    this.modes = this.plugins.reduce((modes, { apply: { defaultModes } }) => {
      return Object.assign(modes, defaultModes)
    }, {})
  }

  /**
   * 提供运行时链式修改webpack实例配置能力，允许在生成最终的原始webpack配置之前对其进行进一步调整
   * 参考文档: https://github.com/mozilla-neutrino/webpack-chain
   */
  resolveChainableWebpackConfig() {
    const chainableConfig = new Config()
    this.webpackChainFns.forEach(fn =>
      fn(chainableConfig, {
        addedTags: this.addedTags,
        addEntryImportsAheadOptions: this.addEntryImportsAheadOptions,
        addEntryCodeAheadOptions: this.addEntryCodeAheadOptions,
        replaceFileOptions: this.replaceFileOptions,
      }),
    )
    return chainableConfig
  }

  /**
   * 给pluginApi提供回调处理最终webpack配置的接口，生成最终的 webpack 配置并应用
   */
  resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
    // 获取原始配置
    let config = chainableConfig.toConfig()
    const original = config
    // 应用原始配置
    this.webpackRawConfigFns.forEach(fn => {
      if (whatType(fn) === 'function') {
        // function with optional return value
        const res = fn(config)
        if (res) config = merge(config, res)
      } else if (fn) {
        // 合并value
        config = merge(config, fn)
      }
    })

    // https://github.com/vuejs/vue-cli/issues/2206
    // 如果config被merge-webpack合并, 会默认丢弃webpack-chain注入的__ruleNames信息
    // 这里需要进行恢复, 以便vue检查正常工作。
    if (config !== original) {
      cloneRuleNames(config.module && config.module.rules, original.module && original.module.rules)
    }

    // 检查用户是否手动更改了webpack.output.publicPath
    // 这里增量项目应该是使用 vue.config.js的publicPath
    // todo

    if (whatType(config.entry) !== 'function') {
      let entryFiles
      if (whatType(config.entry) === 'string') {
        entryFiles = [config.entry]
      } else if (whatType(config.entry) === 'array') {
        entryFiles = config.entry
      } else {
        entryFiles = Object.values(config.entry || []).reduce((allEntries, curr) => {
          return allEntries.concat(curr)
        }, [])
      }

      // 生成入口文件的配置
      entryFiles = entryFiles.map(file => path.resolve(this.context, file))
      process.env.VUE_CLI_ENTRY_FILES = JSON.stringify(entryFiles)
    }

    return config
  }

  /**
   * 加载env环境配置和项目中用户自定义配置
   */
  initConfig() {
    // 加载env环境配置
    this._generatorEnv()
    // 加载用户项目中的个性化工程配置
    // 挂载配置文件中的webpack配置信息
    let userOptions = this.userOptions || {}
    if (Object.keys(userOptions).length === 0) {
      error('用户信息配置有误～')
      return false
    }
    this.projectOptions = defaultsDeep(userOptions, defaults())
  }

  /**
   * 从项目配置文件中收集Webpack配置
   */
  webpackCB() {
    if (this.projectOptions.chainWebpack) {
      this.webpackChainFns.push(this.projectOptions.chainWebpack)
    }
    if (this.projectOptions.configureWebpack) {
      this.webpackRawConfigFns.push(this.projectOptions.configureWebpack)
    }
  }

  /**
   * 初始化插件逻辑
   * 内置配置插件优先执行
   */
  async initPlugins() {
    // 插件机制的生命周期设计
    // Todo
    // 插件自定义参数
    const romePluginOptions = this.projectOptions._romePluginOptions
    delete this.projectOptions._romePluginOptions
    // 执行插件
    const plugins = this.plugins
    for (const plugin of plugins) {
      const { id, apply, isRomePlugin } = plugin
      const api = new romePluginAPI(id, this)
      if (isRomePlugin) {
        // 构造对应插件的api
        const pluginModule = new apply(
          api,
          Object.assign({}, this.projectOptions, romePluginOptions[id]),
        )
        // 插件执行前生命周期
        if (pluginModule.beforeInstall) {
          await pluginModule.beforeInstall()
        }
        await pluginModule.install()
        // 插件执行后生命周期
        if (pluginModule.afterInstall) {
          await pluginModule.afterInstall()
        }
      } else {
        // 原Vue CLI插件
        await apply(api, this.projectOptions)
      }
    }
    // 收集配置文件中的webpack配置
    this.webpackCB()
  }

  async runCommand() {
    const command = this.commandOptions['name']
    let args = this.commandOptions['args']
    args._ = args._ || []
    const rawArgv = this.commandOptions['rawArgv']
    const commandCB = this.commands[command]
    //  原Vue CLI TODO: help
    if (!command || args.help || args.h) {
      command = this.commands.help
    } else {
      // 调用命令后移除命令
      args._.shift()
      rawArgv.shift()
    }
    if (commandCB) {
      const { fn } = commandCB
      if (whatType(fn).indexOf('function') < 0) {
        error('注册指令的回调需要是函数～')
        return false
      }
      await fn(args, rawArgv)
    } else {
      warn(`插件集中没找到匹配${command}的命令~`)
    }
  }

  /**
   * 加载项目中配置文件vue.config.js的配置
   */
  loadUserOptions() {
    // vue.config.js
    let fileConfig, pkgConfig, resolved, resolvedFrom
    const configPath =
      process.env.VUE_CLI_SERVICE_CONFIG_PATH || path.resolve(this.context, 'vue.config.js')
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = require(configPath)

        if (typeof fileConfig === 'function') {
          fileConfig = fileConfig()
        }

        if (!fileConfig || typeof fileConfig !== 'object') {
          error(
            `Error loading ${chalk.bold(
              'vue.config.js',
            )}: should export an object or a function that returns object.`,
          )
          fileConfig = null
        }
      } catch (e) {
        error(`Error loading ${chalk.bold('vue.config.js')}:`)
        throw e
      }
    }

    if (fileConfig) {
      if (pkgConfig) {
        warn(
          `"vue" field in package.json ignored ` +
            `due to presence of ${chalk.bold('vue.config.js')}.`,
        )
        warn(
          `You should migrate it into ${chalk.bold('vue.config.js')} ` +
            `and remove it from package.json.`,
        )
      }
      resolved = fileConfig
      resolvedFrom = 'vue.config.js'
    } else if (pkgConfig) {
      resolved = pkgConfig
      resolvedFrom = '"vue" field in package.json'
    } else {
      resolved = this.inlineOptions || {}
      resolvedFrom = 'inline options'
    }

    if (resolved.css && typeof resolved.css.modules !== 'undefined') {
      if (typeof resolved.css.requireModuleExtension !== 'undefined') {
        warn(
          `You have set both "css.modules" and "css.requireModuleExtension" in ${chalk.bold(
            'vue.config.js',
          )}, ` + `"css.modules" will be ignored in favor of "css.requireModuleExtension".`,
        )
      } else {
        warn(
          `"css.modules" option in ${chalk.bold('vue.config.js')} ` +
            `is deprecated now, please use "css.requireModuleExtension" instead.`,
        )
        resolved.css.requireModuleExtension = !resolved.css.modules
      }
    }

    // normalize some options
    ensureSlash(resolved, 'publicPath')
    if (typeof resolved.publicPath === 'string') {
      resolved.publicPath = resolved.publicPath.replace(/^\.\//, '')
    }
    removeSlash(resolved, 'outputDir')

    // validate options
    validate(resolved, msg => {
      error(`Invalid options in ${chalk.bold(resolvedFrom)}: ${msg}`)
    })

    return resolved
  }

  async loadEnv(mode = process.env.VUE_CLI_MODE) {
    const basePath = path.resolve(this.context, `.env${mode ? `.${mode}` : ``}`)
    const localPath = `${basePath}.local`

    const load = envPath => {
      try {
        const env = dotenv.config({ path: envPath, debug: process.env.DEBUG })
        dotenvExpand(env)
      } catch (err) {
        // 找不到文件时忽略错误
        if (err.toString().indexOf('ENOENT') < 0) {
          error(err)
        }
      }
    }
    load(localPath)
    load(basePath)
    // 默认情况下，除非模式是生产或测试，否则NODE_ENV和BABEL_ENV设置为“开发”。 但是.env文件中的值将具有更高的优先级。
    if (mode) {
      // 始终在测试期间设置NODE_ENV
      const shouldForceDefaultEnv =
        process.env.VUE_CLI_TEST && !process.env.VUE_CLI_TEST_TESTING_ENV
      const defaultNodeEnv = mode === 'production' || mode === 'test' ? mode : 'development'
      if (shouldForceDefaultEnv || process.env.NODE_ENV == null) {
        process.env.NODE_ENV = defaultNodeEnv
      }
      if (shouldForceDefaultEnv || process.env.BABEL_ENV == null) {
        process.env.BABEL_ENV = defaultNodeEnv
      }
    }
  }

  _generatorEnv() {
    const { name, args, rawArgv } = this.commandOptions
    // 默认优先取环境变量
    let mode = process.env.VUE_CLI_MODE
    mode = args.mode || (name === 'build' && args.watch ? 'development' : this.modes[name])
    // load mode .env
    if (mode) {
      this.loadEnv(mode)
    }
    // load base .env
    this.loadEnv()
  }

  /**
   * service内置配置
   */
  innerDefaultConfig() {}

  async run() {
    // warn(`hello , 我是RomeService中拆出用于启动对标Vue CLI service插件的run>`)
    // 加载env环境配置和项目中用户自定义配置
    this.initConfig()
    // 初始化和加载所有插件
    await this.initPlugins()
    // 根据匹配到的命令去执行对应的回调
    await this.runCommand()
  }

  getAttrs(options) {
    return Object.keys(options).reduce((memo, key) => {
      return memo.concat(`${key}="${options[key]}"`)
    }, [])
  }

  appendToHead(tag, options) {
    this.addedTags.push({
      target: 'head',
      content: [`<${tag}`, ...this.getAttrs(options), '/>'].join(' '),
    })
  }

  addHTMLTag({ target, tag, attrs }) {
    this.addedTags.push({
      target,
      content: [`<${tag}`, ...this.getAttrs(attrs), '/>'].join(' '),
    })
  }

  addHTMLMeta(options = {}) {
    this.appendToHead('meta', options)
  }

  addHTMLLink(options = {}) {
    this.appendToHead('link', options)
  }

  addHTMLStyle(options) {
    const { content = '', ...attrs } = options
    const newAttrs = this.getAttrs(attrs)
    this.addedTags.push({
      target: 'head',
      content: [
        `<style${newAttrs.length ? ' ' : ''}${newAttrs.join(' ')}>`,
        content
          .split('\n')
          .map(line => `  ${line}`)
          .join('\n'),
        '</style>',
      ].join('\n'),
    })
  }

  getScriptContent(options) {
    const { content, ...attrs } = options
    if (content && !attrs.src) {
      const newAttrs = this.getAttrs(attrs)
      return [
        `<script${newAttrs.length ? ' ' : ''}${newAttrs.join(' ')}>`,
        content
          .split('\n')
          .map(line => `  ${line}`)
          .join('\n'),
        '</script>',
      ].join('\n')
    }
    const newAttrs = this.getAttrs(attrs)
    return `<script ${newAttrs.join(' ')}></script>`
  }

  addHTMLHeadScript(options) {
    const content = this.getScriptContent(options)
    this.addedTags.push({
      target: 'head',
      content,
    })
  }

  addHTMLBodyScript(options) {
    const content = this.getScriptContent(options)
    this.addedTags.push({
      target: 'body',
      content,
    })
  }
}
