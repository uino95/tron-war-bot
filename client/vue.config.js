// vue.config.js
module.exports = {
  chainWebpack: config => {
    config
      .plugin('VuetifyLoaderPlugin')
      .tap(() => {
        return [{
          match(originalTag, {
            kebabTag,
            camelTag,
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
  }
}
