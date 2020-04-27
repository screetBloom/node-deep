// 本地调试的配置
// process.env.SELF_TEST = true
// process.env.VUE_CLI_SKIP_WRITE = true

const Service = require('../../packages/core/class/rome-service/RomeService')
const path = require('path')

async function ServiceTest() {
  const service = new Service(__dirname)

  // 启动RomeService
  await service.run('serve')
}

ServiceTest()