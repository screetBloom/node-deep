// (api, options) => {

// }

class Plugin {
  constructor(romeApi, options = {}) {
    this.api = romeApi
    this.options = options
  }
  install() {
    console.log(' plugin1 的generator模块被执行了')
    this.api.render({
      'public/index.html': './template/public/index.html',
      'src/app.vue': './template/src/App.vue',
      '/test.js': './template/src/test.js',
    })
    this.api.extendPackage({
      scripts: {
        serve: 'vue-cli-service serve',
        build: 'vue-cli-service build',
      },
      devDependencies: {
        'vue-template-compiler': '^2.6.11',
      },
      browserslist: ['> 1%', 'last 2 versions'],
    })
  }
}

module.exports = Plugin
