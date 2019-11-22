// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('VuetifyLoaderPlugin')
      .tap(args => {
        return [{
          match(originalTag, {
            kebabTag,
            camelTag,
            path,
            component
          }) {
            if (kebabTag.startsWith('core-')) {
              return [camelTag, `import ${camelTag} from '@/components/${camelTag.substring(4)}.vue'`]
            }
          }
        }]
      })
  },
  devServer: {
    port: 8080,
<<<<<<< HEAD
=======

>>>>>>> 777bbd4d88a0f6fb156f171f1f104f5a6e3982a6
  }
}
