import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Codes from '../views/Codes.vue'
import CodeCheck from '../views/CodeCheck.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/codes',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/codes',
    name: 'Codes',
    component: Codes,
  },
  {
    path: '/:code',
    name: 'CodeCheck',
    component: CodeCheck,
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
