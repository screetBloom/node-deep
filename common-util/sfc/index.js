const vueTemplateCompiler = require('vue-template-compiler')
const fs = require('fs-extra')

function main() {
  const vueContent = fs.readFileSync('./index.vue', 'utf8')
  // console.log('\n')
  // console.log(vueContent)
  // console.log('\n')
  const parsed = vueTemplateCompiler.parseComponent(vueContent, {
    pad: 'space',
  })
  const routeBlock = parsed.customBlocks.find((b) => b.type === 'route')
  let res = {}
  if (routeBlock && routeBlock.content) {
    try {
      // res = JSON.parse(routeBlock.content)
      const bodyStr = routeBlock.content.replace('\n', '')
      const func = new Function(`return ${bodyStr}`);
      res = func()
    } catch (e) {
      console.log(e)
    }
  }
  console.log(res)
}

function whatType(obj) {
  return Object.prototype.toString
    .call(obj)
    .toLowerCase()
    .replace(/(\[object\s)(\w+)(])/g, '$2')
}

main()
