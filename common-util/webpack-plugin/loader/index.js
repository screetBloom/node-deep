module.exports = function (source, map) {
  const filepath = this.resourcePath
  if (filepath.indexOf('webpack-plugin/src/index.js') >= 0) {
    const newSource = source.replace('test()', `test('xiao li li')`)
    this.callback(null, newSource, map)
  }
}
