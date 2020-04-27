#!/usr/bin/env node

const { semver, error } = require('@vue/cli-shared-utils')
const pkg = require('../package.json')
const requiredVersion = pkg.engines && pkg.engines.node

if (requiredVersion && !semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but vue-cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

const RomeService = require('../class/rome-service/RomeService')
const romeService = new RomeService()

// 所有入参
const rawArgv = process.argv.slice(2)
// 所有列表中的长定义是否存在
const args = require('minimist')(rawArgv, {
  boolean: [
    // build
    'modern',
    'report',
    'report-json',
    'inline-vue',
    'watch',
    // serve
    'open',
    'copy',
    'https',
    // inspect
    'verbose'
  ]
})
const command = args._[0]

romeService.run(command, args, rawArgv).catch(err => {
  error(err)
  process.exit(1)
})
