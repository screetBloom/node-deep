#!/usr/bin/env node
const spawn = require('child_process').spawn
const publishEnv = process.env.AWP_DEPLOY_ENV || 'test'
const plugins = ['project', 'component']

async function runShell(command, options) {
  options = options || {}

  return new Promise(function(resolve, reject) {
    let shell = spawn('sh', ['-c', command], {
      cwd: options.cwd || process.cwd(),
      env: process.env,
      stdio: 'inherit',
    })

    shell.on('close', function(code, signal) {
      if (code) {
        reject(new Error('code:' + code + ',signal:' + signal))
      } else {
        resolve()
      }
    })

    shell.on('error', function(e) {
      reject(e)
    })
  })
}

async function main() {
  runShell('rm -rf ./talos/build')
  try {
    plugins.forEach(async i => {
      const cmd = `ncc build talos/entry/${i}.js -o build/${i}${
        publishEnv === 'production' ? '' : `-${publishEnv}`
      }`
      const res = await runShell(cmd).stdout
      console.log(`${i}卡控插件校验结果:`, res)
    })
  } catch (e) {
    console.error(e)
  }
}

main()
