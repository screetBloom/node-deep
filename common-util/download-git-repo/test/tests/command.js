const { chalk } = require('@vue/cli-shared-utils')

const dirCheck = require('../service/check/directory/index')
const dirCheckRes = dirCheck('component')
// 依赖卡控
const depCheck = require('../service/check/dependency/index')
const depCheckRes = depCheck()

if (!dirCheckRes || !depCheckRes) {
  console.log(chalk.red(`----------------------全部卡控结束, 未符合卡控标准----------------------`))
  process.exit(1)
}
if (dirCheckRes && depCheckRes) {
  console.log(chalk.green(`----------------------全部符合卡控标准           ----------------------`))
  process.exit(0)
}
