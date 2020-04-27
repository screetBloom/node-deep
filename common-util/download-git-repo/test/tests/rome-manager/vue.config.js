module.exports = {
  pluginOptions: {
    stylelint: {
      // http://git.sankuai.com/projects/HFE/repos/vue-cli-plugin-stylelint/browse
      lintOnSave: process.env.NODE_ENV === 'beta', // boolean | 'error'
      options: {},
    },
    rome: {
      presets: [],
      plugins: [
        {
          name: 'rome-plugin-1',
          enable: true,
          testOptions: 'hhh',
        },
        // 'rome-plugin-2',
        '@nibfe/rome-plugin-2',
      ],
    },
  },
  // rome: {
  //   presets: ['@nibfe/rome-preset-1'],
  //   plugins: [
      // {
      //   name: 'rome-plugin-1',
      //   enable: true,
      //   testOptions: 'hhh',
      // },
      // 'rome-plugin-2',
  //   ],
  // },
}
