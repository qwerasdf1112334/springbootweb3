import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
// import Mock from './mock'
// Mock.bootstrap();
import 'font-awesome/css/font-awesome.min.css'

import axios from 'axios'
//配置axios的全局基本路径
axios.defaults.baseURL='/api'
//全局属性配置，在任意组件内可以使用this.$http获取axios对象
Vue.prototype.$http = axios

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})
// 请大家 注释掉前置拦截器
router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path == '/login') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  let user = JSON.parse(localStorage.getItem('user'));
  let token = localStorage.getItem('token');
  if (!token && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})
// axios请求拦截器:添加请求拦截器，在请求头中加token
axios.interceptors.request.use(
    config => {
      // 从localStorage中获取token
      let token = localStorage.getItem("token");

      // 如果token有值,我们就放到请求头里面
      if (token) {
        config.headers.token = token;
      }
      return config
    },
    error => {
      return Promise.reject(error)
    })
// 响应拦截器
axios.interceptors.response.use(function(response){
  //对返回的数据进行操作
  let result = response.data;  // response.data 就是后端返给我们的数据
  if(!result.success && result.message == "noLogin"){ // 说明未登录,被拦截了,那么就要跳回到登陆页面
    router.push({ path: '/login' });  // 跳转回登陆页面,让用户登陆
  }
  if(result.message == "noPermission"){ // 说明未登录,被拦截了,那么就要跳回到登陆页面
    router.push({ path: '/403' });  // 跳转回登陆页面,让用户登陆
  }
  return response
},function(err){
  return Promise.reject(err)
})


//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

