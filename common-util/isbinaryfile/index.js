const { isBinaryFileSync } = require('isbinaryfile')
const path = require('path')

const name = path.resolve(process.cwd(), '../../tests/a.png')
console.log(isBinaryFileSync(name))

