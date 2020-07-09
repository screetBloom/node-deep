const { parseComponent, compile } = require('vue-template-compiler/build')

function main(source, cwd = process.cwd()) {
  const sfc = parseComponent(source)
  console.log(' >', sfc)
  sfc.template.content = fs.readFileSync(
    path.resolve(cwd, sfc.template.src),
    'utf-8'
  )
  const templateAst = compile(sfc.template.content, {
    comments: true
  }).ast
}

