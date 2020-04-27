const { chalk } = require('@vue/cli-shared-utils')
// 目录卡控
const dirCheck = require('../../packages/cli/service/check/directory/index')
// 依赖卡控
const depCheck = require('../../packages/cli/service/check/dependency/index')

/*
* 程序入口
*/
async function main() {
  const dirCheckRes = dirCheck("project")
  const depCheckRes = depCheck("project")
  if (!dirCheckRes || !depCheckRes) {
    console.log(chalk.red(`----------------------全部卡控结束, 未符合卡控标准----------------------`))
    process.exit(231)
  }
  if (dirCheckRes && depCheckRes) {
    console.log(chalk.green(`----------------------全部符合卡控标准           ----------------------`))
    process.exit(0)
  }
}

main()