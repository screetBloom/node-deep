var inquirer = require('inquirer')

async function firstFunc() {
  return inquirer
    .prompt([
      {
        name: 'templateConfig',
        type: 'list',
        message: `请选择要复制的模板类型:`,
        choices: [
          {
            name: 'Api',
            value: 'api'
          },
          {
            name: 'Component',
            value: 'component'
          },
          {
            name: 'Module',
            value: 'module'
          },
          {
            name: 'Page',
            value: 'page'
          }
        ]
      },
      {
        type: 'input',
        name: 'templateApi',
        message: '请输入 API 模块名称，例如 order',
        when: answer => {
          if (answer.templateConfig && answer.templateConfig === 'api')
            return true
        },
        validate(value) {
          if (!value.length) {
            console.log('\n >>> API 模块名称不能为空')
            return false
          }
          return true
        }
      }
    ])
    .then(answers => answers)
}

async function main(params) {
  const first = await firstFunc()
  console.log('first >', first)
}

main()
