const Config = require('webpack-chain')
const webpack = require('webpack')

async function resolveWebpack() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) return reject(err)
      if (stats.hasErrors()) return reject(`Build failed with errors.`)
      resolve()
    })
  })
}

async function main() {
  const chainConfig = new Config()
  chainConfig.output.globalObject(`(typeof self !== 'undefined' ? self : this)`)
  // 应用在项目中
  await resolveWebpack()
}

main()
