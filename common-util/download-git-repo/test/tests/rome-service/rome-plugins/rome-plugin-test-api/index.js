class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install(){
    const api = this.api
    // todo 增加其他api测试
    console.log(api.hasPlugin('rome-plugin-test-api'))

    api.registerCommand('serviceCommand', args => {
      console.log('serviceCommand注册成功')
    })

    api.chainWebpack(config => {
      console.log('chainWebpack')
    })

    api.configureWebpack(config => {
      console.log('configureWebpack')
    })

    api.configureDevServer(config => {
      console.log('configureDevServer')
    })
  }
}

module.exports = Plugin
