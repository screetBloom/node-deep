class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    const api = this.api;
    console.log('---- 我是插件custom-command-plugin 的service, 我被执行拉');

    api.registerCommand('serviceCommand', args => {
        console.log('serviceCommand注册成功')
    })
  }
}

module.exports = Plugin
