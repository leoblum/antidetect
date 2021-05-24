const {getThemeVariables} = require('antd/dist/theme')

module.exports = {
  plugins: [
    {
      plugin: require('craco-less'),
      options: {
        lessLoaderOptions: {
          lessOptions: {
            // modifyVars: getThemeVariables({
            //   dark: true,
            // }),
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
}
