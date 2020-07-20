const recast = require('recast')
const fs = require('fs-extra')

function getFileContent(source) {
  // const astTree = recast.parse(source)
  return recast.print(recast.parse(source)).code
  // return ''
}

function test() {
  try {
    const source = fs.readFileSync('./app.vue', { encoding: 'utf-8' })
    const fileStr = getFileContent(source)
    const target = './test.vue'
    fs.outputFileSync(target, fileStr)
  } catch (e) {
    console.log(e)
  }
}

test()
