
var inquirer = require('inquirer')

inquirer.prompt([
  {
    type: 'confirm',
    name: 'handSome',
    message: 'Are you handsome?',
    default: true
  },
  {
    type: 'confirm',
    name: 'isOk',
    message: 'Are you ok?',
    default: true
  }
]).then((answers) => {
  console.log('结果为: >')
  console.log(answers)
})