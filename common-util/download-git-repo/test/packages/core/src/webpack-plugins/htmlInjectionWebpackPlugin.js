const cheerio = require('cheerio')

function HtmlInjectionWebpackPlugin(options = {}) {
  const { addedTags = [] } = options
  HtmlInjectionWebpackPlugin.prototype.apply = compiler => {
    compiler.hooks.emit.tap('HtmlInjectionWebpackPlugin', compilation => {
      // console.log('compilation.assets', compilation.assets)
      for (const key in compilation.assets) {
        if (key.endsWith('.html')) {
          // console.log(key, ':', compilation.assets[key])
          const content = compilation.assets[key].source()
          const $ = cheerio.load(content)
          addedTags.forEach(tag => {
            const { target, content } = tag
            $(target).append(content)
          })
          const html = $.html()

          compilation.assets[key] = {
            // 返回文件内容
            source: () => html,
            // 返回文件大小
            size: () => html.length,
          }
        }
      }
    })
  }
}

module.exports = HtmlInjectionWebpackPlugin
