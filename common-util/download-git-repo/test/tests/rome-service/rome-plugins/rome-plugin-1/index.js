class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    console.log(' 我是plugin1 -> 我的service模块被执行了～')
    this.api.registerCommand('firstCommand', async args => {
      console.log(' 我是plugin1 -> 我的自定义指令firstCommand被调用了 ～ ')
    })
    this.api.chainWebpack(config => {
      config.output.path('test-dist')
    })
    const webpackConfig = this.api.resolveWebpackConfig()
  }
}

module.exports = Plugin
