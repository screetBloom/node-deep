const Service = require('../../packages/core/class/rome-service/RomeService')
const path = require('path')

// 测试本地文件类型、npm包类型和vue-cli生态的插件发现

async function ServiceTest() {
  const service = new Service()

  // 启动RomeService
  await service.run('serve')
}

ServiceTest()
