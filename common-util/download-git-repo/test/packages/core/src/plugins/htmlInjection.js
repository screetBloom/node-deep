const HtmlInjectionWebpackPlugin = require('../webpack-plugins/htmlInjectionWebpackPlugin.js')

/**
 * 内置插件，通过 Webpack Plugin 装载 HTML 注入相关的 API
 */
module.exports = class HtmlInjectionPlugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }

  install() {
    const api = this.api

    api.chainWebpack((config, options = {}) => {
      const { addedTags } = options
      config.plugin('html-injection').use(HtmlInjectionWebpackPlugin, [
        {
          addedTags,
        },
      ])
    })
  }
}
