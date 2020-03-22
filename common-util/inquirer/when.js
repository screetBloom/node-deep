var inquirer = require('inquirer')

async function firstFunc() {
  return inquirer
    .prompt([
      {
        name: 'isNext',
        message: '是否要进行下一次对话？',
        type: 'confirm'
      }
    ])
    .then(answers => answers)
}

async function afterFunc(params = {}) {
  console.log('params >', params.when)
  return inquirer
    .prompt([
      {
        name: 'someFlag',
        when: param => {
          return !!params.when
        },
        message: 'Do you want to turn on flag foo?',
        type: 'confirm'
      }
    ])
    .then(answers => answers)
}

async function main(params) {
  const first = await firstFunc()
  const afterAnswer = await afterFunc({ when: first.isNext })
  console.log('afterAnswer >', afterAnswer)
}

main()
