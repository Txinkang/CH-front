import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'


import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
// 使用中文语言包
app.use(ElementPlus, {
    locale: zhCn
  })
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')