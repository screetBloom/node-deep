const Config = require('webpack-chain')

async function main() {
  const chainConfig = new Config()
  chainConfig.output.globalObject(`(typeof self !== 'undefined' ? self : this)`)
}

main()
