function whatType(obj) {
  return Object.prototype.toString
    .call(obj)
    .toLowerCase()
    .replace(/(\[object\s)(\w+)(])/g, '$2')
}

/*
 * 求数组是否正则包含某个值
 * @param arr: 子元素可能为正则表达式
 * @param val: 字符串
 */
function regIncludes(arr, val) {
  let resFlag = []
  arr.forEach(i => {
    // 子元素为正则表达式
    if (whatType(i) === 'regexp') {
      resFlag.push(i.test(val))
    } else {
      // 默认为字符串
      resFlag.push(i === val)
    }
  })
  // 若有一个key判断为true, 则证明包含
  const passLength = resFlag.filter(i => i).length
  if (passLength > 1) {
    console.log(`正则匹配到符合条件的文件数量为:${passLength}, 请注意正则的准确性～`)
  }
  return passLength > 0
}

/*
 * 求数组交集、差集
 */
function arrDiff(arr1 = [], arr2 = []) {
  const intersection = arr1.filter(v => regIncludes(arr2, v))
  const difference = arr1.filter(x => !regIncludes(arr2, x))
  return {
    intersection,
    difference,
  }
}

function main() {
  const all = ['bin', 'generator', 'service', 'talos', '.commitlintrc.js', '.git.js']
  const mustInclude = ['bin', /^\.(.+)js$/]
  console.log('res >', arrDiff(all, mustInclude))
}

main()
