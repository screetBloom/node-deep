const { getOptions } = require('loader-utils')

module.exports = function(source) {
  console.log('--- 🚀loader replace-loader start \n')
  const options = getOptions(this)
  const injectStr = options.replaceStr
  source = replaceStr
  console.log('--- 🚀loader replace-loader end \n')
  return source
}
