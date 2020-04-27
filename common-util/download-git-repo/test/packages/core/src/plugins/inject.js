const glob = require('glob')
const path = require('path')

const importsToStr = function(imports) {
  return imports.map(imp => {
    const { source, specifier } = imp
    if (specifier) {
      return `import ${specifier} from '${source}'`
    } else {
      return `import '${source}'`
    }
  })
}

/**
 * 该插件要在所有config之前加载
 */
class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    const api = this.api
    const {
      addEntryImportsAheadOptions,
      addEntryCodeAheadOptions,
      replaceFileOptions,
    } = api.service

    const injectStr =
      importsToStr(addEntryImportsAheadOptions).join('\r\n') +
      '\r\n' +
      addEntryCodeAheadOptions.join('\r\n')

    //在webpack中添加inject-loader
    const rootPath = api.getCwd()
    const pages = glob.sync(`${rootPath}/src/pages/*/main.js`)

    if (addEntryImportsAheadOptions || addEntryCodeAheadOptions) {
      api.chainWebpack(webpackConfig => {
        webpackConfig.module
          .rule('inject-js')
          .test(/\.js$/)
          .include.add(filepath => {
            //只包含所有页面入口文件main.js
            if (pages.includes(filepath)) {
              return true
            }
          })
          .end()
          .use('inject-loader')
          .loader(path.resolve(__dirname, '../webpack-plugins/inject-loader'))
          .options({
            injectStr,
          })
          .end()
      })
    } else if (replaceFileOptions.length) {
      api.chainWebpack(webpackConfig => {
        webpackConfig.module
          .rule('replace-js')
          .test(/\.js$/)
          .include.add(filepath => {
            //只包含所有页面入口文件main.js
            if (pages.includes(filepath)) {
              return true
            }
          })
          .end()
          .use('replace-loader')
          .loader(path.resolve(__dirname, '../webpack-plugins/replace-loader'))
          .options({
            replaceStr,
          })
      })
    }
  }
}

module.exports = Plugin
