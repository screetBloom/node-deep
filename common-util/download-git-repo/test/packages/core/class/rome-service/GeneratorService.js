/**
 * 对标Vue CLI的generator启动函数
 */
let romeGeneratorAPI = require('../rome-api/generator-api/index')
if (process.env.SELF_TEST) {
  // 自己本地进行侵入式测试时使用
  romeGeneratorAPI = require('@vue/cli-new/lib/GeneratorAPI')
}
const RomeDependence = require('../rome-dependence/RomeDependence')
const ejs = require('ejs')
const {
  ConfigTransform,
  getPkg,
  writeFileTree,
  normalizeFilePaths,
  runCodemod,
  injectImports,
  injectOptions,
  sortObject,
} = new RomeDependence()
const path = require('path')
const runtimePkgPath = path.join(process.cwd(), './package.json')

const {
  whatType,
  CREATE_KEY,
  resolveModule,
  romeRequire,
  ABSOLUTE_PLUGIN_PROMPTS_PATH,
} = require('../../src/lib/util')
const { warn, error, chalk } = require('@vue/cli-shared-utils')
// inquirer对话
const inquirer = require('inquirer')

const defaultConfigTransforms = {
  babel: new ConfigTransform({
    file: {
      js: ['babel.config.js'],
    },
  }),
  postcss: new ConfigTransform({
    file: {
      js: ['postcss.config.js'],
      json: ['.postcssrc.json', '.postcssrc'],
      yaml: ['.postcssrc.yaml', '.postcssrc.yml'],
    },
  }),
  eslintConfig: new ConfigTransform({
    file: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      yaml: ['.eslintrc.yaml', '.eslintrc.yml'],
    },
  }),
  jest: new ConfigTransform({
    file: {
      js: ['jest.config.js'],
    },
  }),
  browserslist: new ConfigTransform({
    file: {
      lines: ['.browserslistrc'],
    },
  }),
}

const reservedConfigTransforms = {
  vue: new ConfigTransform({
    file: {
      js: ['vue.config.js'],
    },
  }),
}

// 字符流结尾增加换行, 防止面条式写入
const ensureEOL = str => {
  if (str.charAt(str.length - 1) !== '\n') {
    return str + '\n'
  }
  return str
}

/**
 * 除了自身功能，也要满足generatorApi对上游类的要求，因此构造函数定义时需要覆盖generatorApi的能力诉求
 * 后续具体实现时会rome的建设计划分期拆分实现
 */
module.exports = class Generator {
  constructor(plugins = [], cwd = process.cwd(), options, userOptions = {}) {
    // 命令配置参数
    this.commandOptions = options
    this.rootOptions = userOptions
    // 保留初始状态插件集
    this.romePlugins = plugins
    this.plugins = plugins
    // 运行时上下文对应的path
    this.context = cwd
    // 运行时pkg
    this.originalPkg = getPkg(cwd)
    this.pkg = Object.assign({}, this.originalPkg)
    // 虚拟文件树
    this.files = {}
    this.fileMiddlewares = []
    // 所有普通文件在内存中渲染成字符串完成之后要执行的遍历回调
    this.postProcessFilesCbs = []
    // 插件通过 GeneratorAPI 暴露的 addConfigTransform 方法添加如何提取配置文件
    this.configTransforms = {}
    // 默认的配置文件
    this.defaultConfigTransforms = defaultConfigTransforms
    // 保留的配置文件 vue.config.js
    this.reservedConfigTransforms = reservedConfigTransforms
    // 原Vue cli标识
    this.invoking = false
    // 原Vue cli解决冲突对象
    this.depSources = {}
    // 原vue cli用于增加import或者是根实例的配置
    this.imports = {}
    // 原vue cli 4.x插件执行结束后统一调用的回调
    this.afterInvokeCbs = []
    this.afterAnyInvokeCbs = []
    // 原vue cli退出标志的回调
    this.exitLogs = []
  }

  /**
   * GeneratorApi的依赖Api，这里需要进行实现
   */
  hasPlugin() {
    return false
  }

  /**
   * 文件操作
   * 模板拷贝、import&根实例配置注入、文件编辑等相关处理
   */
  async resolveFiles() {
    const files = this.files
    // 负责将提前定义好的目录和文件模板拷贝到初始化的项目中
    for (const middleware of this.fileMiddlewares) {
      await middleware(files, ejs.render)
    }

    // 兼容windows中对path 路径的要求
    normalizeFilePaths(files)

    // 处理import注入和根实例配置的修改
    Object.keys(files).forEach(file => {
      let imports = this.imports[file]
      imports = imports instanceof Set ? Array.from(imports) : imports
      if (imports && imports.length > 0) {
        files[file] = runCodemod(injectImports, { path: file, source: files[file] }, { imports })
      }

      let injections = this.rootOptions[file]
      injections = injections instanceof Set ? Array.from(injections) : injections
      if (injections && injections.length > 0) {
        files[file] = runCodemod(injectOptions, { path: file, source: files[file] }, { injections })
      }
    })

    // 负责具体处理模板项目中的文件
    for (const postProcess of this.postProcessFilesCbs) {
      await postProcess(files)
    }
  }

  /**
   * package.json的merge处理
   */
  sortPkg() {
    this.pkg.dependencies = sortObject(this.pkg.dependencies)
    this.pkg.devDependencies = sortObject(this.pkg.devDependencies)
    this.pkg.scripts = sortObject(this.pkg.scripts, [
      'serve',
      'build',
      'test:unit',
      'test:e2e',
      'lint',
      'deploy',
    ])
    this.pkg = sortObject(this.pkg, [
      'name',
      'version',
      'private',
      'description',
      'author',
      'scripts',
      'main',
      'module',
      'browser',
      'jsDelivr',
      'unpkg',
      'files',
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'vue',
      'babel',
      'eslintConfig',
      'prettier',
      'postcss',
      'browserslist',
      'jest',
    ])
  }

  /**
   * 从package.json中提取配置到如vue.config.js此类的专用文件中
   */
  extractConfigFiles(extractAll = false, checkExisting = false) {
    const configTransforms = Object.assign(
      {},
      defaultConfigTransforms,
      this.configTransforms,
      reservedConfigTransforms,
    )
    const extract = key => {
      if (
        configTransforms[key] &&
        this.pkg[key] &&
        // 如果原始package.json中存在该字段，则不提取
        !this.originalPkg[key]
      ) {
        const value = this.pkg[key]
        const configTransform = configTransforms[key]
        const res = configTransform.transform(value, checkExisting, this.files, this.context)
        const { content, filename } = res
        this.files[filename] = ensureEOL(content)
        delete this.pkg[key]
      }
    }
    if (extractAll) {
      for (const key in this.pkg) {
        extract(key)
      }
    } else {
      if (!process.env.VUE_CLI_TEST) {
        // 默认情况下，始终提取vue.config.js
        extract('vue')
      }
      // 始终提取babel.config.js
      extract('babel')
    }
  }

  /**
   * 从Prompt文件中加载对话数组
   */
  _loadPrompt(pluginPath) {
    const promptExist = resolveModule(`./${ABSOLUTE_PLUGIN_PROMPTS_PATH}`, pluginPath)
    // 如果当前插件配置了prompts.js, add + invoke的时候响应它
    if (promptExist) {
      // 获取问题列表,
      const promptArr = romeRequire(`./${ABSOLUTE_PLUGIN_PROMPTS_PATH}`, pluginPath)
      if (whatType(promptArr) !== 'array') {
        warn('prompts.js暴露出的不是数组～')
        return {}
      }
      try {
        return inquirer.prompt(promptArr).then(answers => answers)
      } catch (e) {
        error(e)
        return {}
      }
    }
  }

  /**
   * 执行插件
   * create时执行所有插件
   */
  async initPlugins(pluginName) {
    // 插件机制的生命周期设计
    // Todo
    // 插件自定义参数
    const romePluginOptions = this.rootOptions._romePluginOptions
    delete this.rootOptions._romePluginOptions
    // 将研发框架定义的结构调整成vue cli需要的结构
    const plugins = this.plugins
    for (const plugin of plugins) {
      const { id, apply, isRomePlugin, path } = plugin
      const api = new romeGeneratorAPI(id, this, {}, this.rootOptions)
      const matchFlag =
        id === pluginName || (this.commandOptions.name === CREATE_KEY && !pluginName)
      if (!matchFlag) {
        continue
      }
      // 加载prompts模块
      const promptsOptions = await this._loadPrompt(path)
      if (isRomePlugin) {
        // 构造对应插件的api
        const pluginModule = new apply(
          api,
          Object.assign({}, this.rootOptions, romePluginOptions[id], promptsOptions),
        )
        // 插件执行前生命周期
        if (pluginModule.beforeInstall) {
          await pluginModule.beforeInstall()
        }
        try {
          await pluginModule.install()
        } catch(e) {
          error(e)
        }
        // 插件执行后生命周期
        if (pluginModule.afterInstall) {
          await pluginModule.afterInstall()
        }
      } else {
        // 原Vue CLI插件
        await apply(api, this.rootOptions)
      }
    }
  }

  async run() {
    const pluginName = this.commandOptions.rawArgv[1]
    // 初始化和执行所有插件
    await this.initPlugins(pluginName)
    // 从package.json中提取配置到如vue.config.js这样的专用文件中
    this.extractConfigFiles()
    // 模板拷贝、import&根实例配置注入、文件编辑等相关处理
    await this.resolveFiles()
    // package.json处理
    this.sortPkg()
    this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'
    // 应用修改前保存
    const initialFiles = Object.assign({}, this.files)
    // 更新文件
    await writeFileTree(this.context, this.files, initialFiles)
    console.log(`👑   ${chalk.white.bgGreen(this.commandOptions.name)}${chalk.green('执行结束～')}`)
    process.exit()
  }
}
