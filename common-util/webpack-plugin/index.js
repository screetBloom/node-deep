const Config = require('webpack-chain')
const AutoInjectPlugin = require('./plugins/index')

function main() {
  const webpackConfig = new Config()
  webpackConfig
    .plugin('auto-Inject')
    .use(AutoInjectPlugin, [{}])
}

main()