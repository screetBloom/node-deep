// 测试环境的入口文件
import Vue from 'vue'
import App from './App.vue'


Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
