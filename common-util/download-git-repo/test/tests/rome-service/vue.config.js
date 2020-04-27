module.exports = {
  pluginOptions: {},
  rome: {
    presets: [],
    plugins: [
      'rome-plugin-test-api-addEntryCodeAhead',
      'rome-plugin-test-api-addEntryImportsAhead',
      'rome-plugin-test-api-addHTMLBodyScript',
      'rome-plugin-test-api-addHTMLHeadScript',
      'rome-plugin-test-api-addHTMLStyle',
      'rome-plugin-test-api-addHTMLLink',
      'rome-plugin-test-api-addHTMLTag',
    ],
  },
}
