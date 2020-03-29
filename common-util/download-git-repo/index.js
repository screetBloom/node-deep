const download = require('download-git-repo')
const exec = require('child_process').execSync
const fs = require('fs-extra')
const spendTime = {
  start: 0,
  end: 0,
  getMS: function() {
    return `${this.end - this.start}ms`
  }
}

async function downloadAsync(repository, tmpDir) {
  if (fs.existsSync(tmpDir)) {
    fs.removeSync(tmpDir)
  }
  return new Promise((resolve, reject) => {
    download(
      repository,
      tmpDir,
      { clone: true },
      err => {
        if (err) return reject(err)
        resolve()
      }
    )
  })
}

async function main(params) {
  spendTime.start = Date.now()
  const temDir = 'test'
  const gitAddress = 'direct:ssh://git@git.sankuai.com/nibfe/rome-cli.git'
  await downloadAsync(gitAddress, temDir)
  const targetPath = './test/packages/core'
  exec(`cd ${targetPath} && mnpm install`)
  spendTime.end = Date.now()
  console.log(`👑  全部更新结束,共耗时 | ${spendTime.getMS()}`)
}

main()
