const path = require('path')
const fs = require('fs')
const { getOptions } = require('loader-utils')

module.exports = function(source) {
  console.log('--- 🚀loader inject-loader start \n')
  const options = getOptions(this)
  const injectStr = options.injectStr
  source = `/** add plugin start */ \n ${injectStr} \n /** add plugin end */ \n ${source}`
  console.log('--- 🚀loader inject-loader end \n')
  return source
}
