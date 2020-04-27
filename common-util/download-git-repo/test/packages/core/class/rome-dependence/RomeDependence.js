// Vue CLI3.x的底层依赖
const Creator3 = require('vue-cli3/lib/Creator')
const Generator3 = require('vue-cli3/lib/Generator')
const GeneratorAPI3 = require('vue-cli3/lib/GeneratorAPI')
const PluginAPI3 = require('vue-cli-service3/lib/PluginAPI')
const VueCliService3 = require('vue-cli-service3/lib/Service')
// 通用方法
const ConfigTransform3 = require('vue-cli3/lib/ConfigTransform')
const getPkg3 = require('vue-cli3/lib/util/getPkg')
const writeFileTree3 = require('vue-cli3/lib/util/writeFileTree')
const normalizeFilePaths3 = require('vue-cli3/lib/util/normalizeFilePaths')
const runCodemod3 = require('vue-cli3/lib/util/runCodemod')
const injectImports3 = require('vue-cli3/lib/util/codemods/injectImports')
const injectOptions3 = require('vue-cli3/lib/util/codemods/injectOptions')
const sortObject3 = require('vue-cli3/lib/util/sortObject')
// cli-service通用方法
const options3 = require('vue-cli-service3/lib/options')
const prepareURLs3 = require('vue-cli-service3/lib/util/prepareURLs')
const prepareProxy3 = require('vue-cli-service3/lib/util/prepareProxy')
const validateWebpackConfig3 = require('vue-cli-service3/lib/util/validateWebpackConfig')
const isAbsoluteUrl3 = require('vue-cli-service3/lib/util/isAbsoluteUrl')
const DashboardPlugin3 = require('vue-cli-service3/lib/webpack/DashboardPlugin')
// 内置命令
const serveCommand3 = require('vue-cli-service3/lib/commands/serve')
// 内置build命令的功能函数
const formatStats3 = require('vue-cli-service3/lib/commands/build/formatStats')
const resolveLibConfig3 = require('vue-cli-service3/lib/commands/build/resolveLibConfig')
const resolveWcConfig3 = require('vue-cli-service3/lib/commands/build/resolveWcConfig')
const resolveAppConfig3 = require('vue-cli-service3/lib/commands/build/resolveAppConfig')
// 内置配置
const appConfig3 = require('vue-cli-service3/lib/config/app')
const baseConfig3 = require('vue-cli-service3/lib/config/base')
const cssConfig3 = require('vue-cli-service3/lib/config/css')
const prodConfig3 = require('vue-cli-service3/lib/config/prod')

// Vue CLI4.x的底层依赖
const Creator4 = require('vue-cli4/lib/Creator')
const Generator4 = require('vue-cli4/lib/Generator')
const GeneratorAPI4 = require('vue-cli4/lib/GeneratorAPI')
const PluginAPI4 = require('vue-cli-service4/lib/PluginAPI')
const VueCliService4 = require('vue-cli-service4/lib/Service')
// 通用方法
const ConfigTransform4 = require('vue-cli4/lib/ConfigTransform')
const getPkg4 = require('vue-cli4/lib/util/getPkg')
const writeFileTree4 = require('vue-cli4/lib/util/writeFileTree')
const normalizeFilePaths4 = require('vue-cli4/lib/util/normalizeFilePaths')
const runCodemod4 = require('vue-cli4/lib/util/runCodemod')
const injectImports4 = require('vue-cli4/lib/util/codemods/injectImports')
const injectOptions4 = require('vue-cli4/lib/util/codemods/injectOptions')
const sortObject4 = require('vue-cli4/lib/util/sortObject')
// cli-service通用方法
const options4 = require('vue-cli-service4/lib/options')
const prepareURLs4 = require('vue-cli-service4/lib/util/prepareURLs')
const prepareProxy4 = require('vue-cli-service4/lib/util/prepareProxy')
const validateWebpackConfig4 = require('vue-cli-service4/lib/util/validateWebpackConfig')
const isAbsoluteUrl4 = require('vue-cli-service4/lib/util/isAbsoluteUrl')
const DashboardPlugin4 = require('vue-cli-service4/lib/webpack/DashboardPlugin')
// 内置命令
const serveCommand4 = require('vue-cli-service4/lib/commands/serve')
// 内置build命令的功能函数
const formatStats4 = require('vue-cli-service4/lib/commands/build/formatStats')
const resolveLibConfig4 = require('vue-cli-service4/lib/commands/build/resolveLibConfig')
const resolveWcConfig4 = require('vue-cli-service4/lib/commands/build/resolveWcConfig')
const resolveAppConfig4 = require('vue-cli-service4/lib/commands/build/resolveAppConfig')
// 内置配置
const appConfig4 = require('vue-cli-service4/lib/config/app')
const baseConfig4 = require('vue-cli-service4/lib/config/base')
const cssConfig4 = require('vue-cli-service4/lib/config/css')
const prodConfig4 = require('vue-cli-service4/lib/config/prod')

// 通用方法
const { resolvePkg } = require('@vue/cli-shared-utils')
const VUE_CLI_SERVICE = '@vue/cli-service'

class RomeDependence {
  constructor(options) {
    const { cwd = process.cwd() } = options
    this.workPkg = resolvePkg(cwd)
    // 返回对象
    const response = {}
    // Vue CLI依赖
    Object.assign(response, this.getVueCLI())
    // Talos依赖
    Object.assign(response, this.getTalos())
    return response
  }

  /**
   * 根据环境匹配底层依赖的Vue CLI
   * 匹配条件可能是Rome/Cli的版本
   * @param {obj} dependencies: 工作目录下的package.json依赖
   */
  getVueCLI() {
    const { dependencies, devDependencies } = this.workPkg
    const vueServiceIsExist =
      dependencies[VUE_CLI_SERVICE] || devDependencies[VUE_CLI_SERVICE] || ''
    const vueServiceVersion = vueServiceIsExist.replace(/(\^|\~)/g, '')
    if (vueServiceVersion && /^(3\.)/.test(vueServiceVersion)) {
      // 底层依赖3.x版本
      return {
        Creator: Creator3,
        Generator: Generator3,
        GeneratorAPI: GeneratorAPI3,
        PluginAPI: PluginAPI3,
        vueCliService: VueCliService3,
        // 通用方法
        ConfigTransform: ConfigTransform3,
        getPkg: getPkg3,
        writeFileTree: writeFileTree3,
        normalizeFilePaths: normalizeFilePaths3,
        runCodemod: runCodemod3,
        injectImports: injectImports3,
        injectOptions: injectOptions3,
        sortObject: sortObject3,
        // 通用cli-service方法
        options: options3,
        prepareURLs: prepareURLs3,
        prepareProxy: prepareProxy3,
        validateWebpackConfig: validateWebpackConfig3,
        isAbsoluteUrl: isAbsoluteUrl3,
        DashboardPlugin: DashboardPlugin3,
        // 内置命令
        serveCommand: serveCommand3,
        // 内置build命令的功能函数
        formatStats: formatStats3,
        resolveLibConfig: resolveLibConfig3,
        resolveWcConfig: resolveWcConfig3,
        resolveAppConfig: resolveAppConfig3,
        // 内置配置
        appConfig: appConfig3,
        baseConfig: baseConfig3,
        cssConfig: cssConfig3,
        prodConfig: prodConfig3,
      }
    } else {
      // 底层依赖4.x版本
      return {
        Creator: Creator4,
        Generator: Generator4,
        GeneratorAPI: GeneratorAPI4,
        PluginAPI: PluginAPI4,
        vueCliService: VueCliService4,
        // 通用方法
        ConfigTransform: ConfigTransform4,
        getPkg: getPkg4,
        writeFileTree: writeFileTree4,
        normalizeFilePaths: normalizeFilePaths4,
        runCodemod: runCodemod4,
        injectImports: injectImports4,
        injectOptions: injectOptions4,
        sortObject: sortObject4,
        // 通用cli-service方法
        options: options4,
        prepareURLs: prepareURLs4,
        prepareProxy: prepareProxy4,
        validateWebpackConfig: validateWebpackConfig4,
        isAbsoluteUrl: isAbsoluteUrl4,
        DashboardPlugin: DashboardPlugin4,
        // 内置命令
        serveCommand: serveCommand4,
        // 内置build命令的功能函数
        formatStats: formatStats4,
        resolveLibConfig: resolveLibConfig4,
        resolveWcConfig: resolveWcConfig4,
        resolveAppConfig: resolveAppConfig4,
        // 内置配置
        appConfig: appConfig4,
        baseConfig: baseConfig4,
        cssConfig: cssConfig4,
        prodConfig: prodConfig4,
      }
    }
  }

  /**
   * 根据环境匹配底层依赖的Talos
   */
  getTalos() {
    // 根据当前环境去匹配对应环境变量, 非容器环境则人工注入默认值
    return {
      talos: {},
    }
  }
}

module.exports = RomeDependence
