// const MyPlugin = require('./plugin/plugin.js')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: path.resolve('./loader/index.js'),
          },
        ],
      },
    ],
  },
}
