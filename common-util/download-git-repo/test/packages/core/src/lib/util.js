[
  'require',
  'common',
  'config-var'
].forEach(module => {
  Object.assign(exports, require(`./${module}`))
})