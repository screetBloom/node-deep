const Scaffold = require('scaffold-generator')
const ejs = require('ejs')
const scaffold = async (from, to, data = {}) => {
  return new Scaffold({
    backup: false,
    override: true,
    data,
    render: (template, data) => {
      return ejs.render(template, data)
  }
  })
  .copy(from, to)
  .then(() => {
    console.log('子组件目录结构已生成～')
  })
}

module.exports = scaffold
