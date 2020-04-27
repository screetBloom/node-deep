class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    console.log('---- 我是插件4的generator, 我被执行拉');
  }
}

module.exports = Plugin
