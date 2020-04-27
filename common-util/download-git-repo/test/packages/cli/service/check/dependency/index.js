const _path = require('path')
const semver = require('semver')
const { chalk } = require('@vue/cli-shared-utils')

/*
 * 枚举依赖规则
 * 规则按照node规范实现semver的要求写即可
 */
const dependenciesRule = {
  vue: '2.5.0 - 2.6.11',
  'vue-router': '3.x.x',
  vuex: '3.x.x',
  'vue-template-compiler': '2.5.0 - 2.6.11',
  axios: '0.19.1 - 0.x.x',
  '@dp/owl': '1.8.14',
  '@hfe/sso-sdk': '4.0.4',
  '@gfe/lx-watcher': '1.5.4',
  'vue-cli-service': '3.x.x || 4.x.x',
  sass: '1.19.0 - 1.x.x',
  'sass-loader': '6.x.x || 7.x.x || 8.x.x',
}

/*
 * 程序入口
 */
module.exports = function(type = 'component') {
  // 依赖卡控入口函数
  return dependenciesControl()
}

/*
 * 输出不符合规范的依赖
 */
function loadDependencies() {
  let nonStandardDep = []
  // 目前仅检索package.json
  const pkgPath = _path.join(process.cwd(), 'package.json')
  const pkg = require(pkgPath)
  // dependencies
  const dependencies = pkg.dependencies
  // devDependencies
  const devDependencies = pkg.devDependencies
  // 所有依赖作为合集
  const allDependencies = Object.assign(dependencies, devDependencies)
  // 所有依赖的key
  const depKeys = Object.keys(allDependencies)
  depKeys.forEach(key => {
    // 试探依赖是否属于卡控范围
    const ruleValue = dependenciesRule[key]
    if (ruleValue) {
      // 属于卡控范围的依赖
      const personalValue = dependencies[key]
      const val = personalValue.replace(/(\^|\~)/g, '')
      if (!semver.satisfies(val, ruleValue)) {
        // 有不符合标准的依赖, 记录在册
        nonStandardDep.push({ key, ruleValue, personalValue })
      }
    }
  })
  return nonStandardDep
}
/*
 * 基础依赖卡控入口函数
 */
function dependenciesControl() {
  const nonStandardDep = loadDependencies()
  nonStandardDep.forEach(i => {
    const { key, ruleValue, personalValue } = i
    console.log(
      chalk.white(`依赖中${key}不符合规范, 应该是:${ruleValue}, 但是实际数据是: `),
      chalk.yellow(`${personalValue}  !!`),
    )
  })
  if (nonStandardDep.length > 0) {
    console.log(
      chalk.yellow(`----------------------依赖不符合卡控标准          ----------------------`),
    )
    return false
  }
  console.log(
    chalk.green(`----------------------依赖符合卡控标准            ----------------------`),
  )
  return true
}
