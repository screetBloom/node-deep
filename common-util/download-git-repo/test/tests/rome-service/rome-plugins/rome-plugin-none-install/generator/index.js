class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    const api = this.api;
    console.log('---- 我是插件rome-plugin-none-install 的generator, 我被执行拉');
  }
}

module.exports = Plugin
