const Service = require('../../packages/core/class/rome-service/RomeService')
const path = require('path')

async function ServiceTest() {
  const service = new Service()

  // 启动RomeService
  await service.run('serviceCommand')
}

ServiceTest()