const Service = require('../../packages/core/class/rome-service/RomeService')
const path = require('path')

async function ServiceTest() {
  const service = new Service(__dirname)

  // 第二个参数是要调用的插件名
  const param = ['invoke', 'rome-plugin-1']
  await service.run('invoke', {}, param)
}

ServiceTest()
