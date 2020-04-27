/**
 * 判断类型，返回小写的已知类型
 * @param {any} obj: 需要判断类型的数据类型
 */
exports.whatType = function(obj) {
  return Object.prototype.toString
    .call(obj)
    .toLowerCase()
    .replace(/(\[object\ )(\w+)(])/g, '$2')
}

/**
 * 字符串去除所有空格, 不止首位
 */
exports.strTrim = function(str) {
  return str.replace(/\s+/g, "")
}

/**
 * function转字符串
 */
exports.function2Str = function(func) {
  if (exports.whatType(func) !== 'function') return
  const str = func.toString() || ''
  return exports.strTrim(str)
}

/**
 * 保留斜线
 */
exports.ensureSlash = function (config, key) {
  const val = config[key]
  if (typeof val === 'string') {
    config[key] = val.replace(/([^/])$/, '$1/')
  }
}

/**
 * 删除斜线
 */
exports.removeSlash = function (config, key) {
  if (typeof config[key] === 'string') {
    config[key] = config[key].replace(/\/$/g, '')
  }
}

exports.cloneRuleNames= function (to, from) {
  if (!to || !from) {
    return
  }
  from.forEach((r, i) => {
    if (to[i]) {
      Object.defineProperty(to[i], '__ruleNames', {
        value: r.__ruleNames
      })
      cloneRuleNames(to[i].oneOf, r.oneOf)
    }
  })
}
