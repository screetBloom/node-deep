const execa = require('execa')
// const exec = require('child_process').execSync

async function main(params) {
  execa('echo', ['hello world'], {
    cwd: process.cwd(),
  })
}

main()
