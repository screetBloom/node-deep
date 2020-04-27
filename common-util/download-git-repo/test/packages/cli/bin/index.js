#!/usr/bin/env node
const _path = require("path");
const semver = require('semver')
const { error } = require('@vue/cli-shared-utils')
const pkg = require('../package.json')
const requiredVersion = pkg.engines && pkg.engines.node
const program = require('commander')
const { chalk } = require('@vue/cli-shared-utils')

// Todo
if (requiredVersion && !semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but vue-cli-service ` +
      `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`,
  )
  process.exit(1)
}

program
  .version(pkg.version, '-v, --version')


program
  .command('projectCheck')
  .description('工程规范校验')
  .action(cmd => {
    const type = "project"
    // 目录卡控
    const dirCheck = require('../service/check/directory/index')
    const dirCheckRes = dirCheck(type)
    // 依赖卡控
    const depCheck = require('../service/check/dependency/index')
    const depCheckRes = depCheck(type)
    if (!dirCheckRes || !depCheckRes) {
      console.log(chalk.red(`----------------------全部卡控结束, 未符合卡控标准----------------------`))
    }
    if (dirCheckRes && depCheckRes) {
      console.log(chalk.green(`----------------------全部符合卡控标准----------------------`))
    }
  })

program
  .command('componentCheck')
  .description('业务组件规范校验')
  .action(cmd => {
    const type = "component"
    // 目录卡控
    const dirCheck = require('../service/check/directory/index')
    const dirCheckRes = dirCheck(type)
    // 依赖卡控
    const depCheck = require('../service/check/dependency/index')
    const depCheckRes = depCheck(type)
    if (!dirCheckRes || !depCheckRes) {
      console.log(chalk.red(`----------------------全部卡控结束, 未符合卡控标准----------------------`))
    }
    if (dirCheckRes && depCheckRes) {
      console.log(chalk.green(`----------------------全部符合卡控标准----------------------`))
    }
  })

program
  .command('help')
  .description('帮助')
  .action(() => {
    program.outputHelp()
  })

program.parse(process.argv)