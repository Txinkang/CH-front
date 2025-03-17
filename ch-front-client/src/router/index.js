import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../Layout/MainLayout.vue'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Announcement from '../views/Announcement.vue'
import Product from '../views/Products.vue'
import Forum from '../views/Forum.vue'
import News from '../views/News.vue'
import Cart from '../views/Cart.vue'
import Culture from '../views/Culture.vue'
import My from '../views/My.vue'
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home
      },
      {
        path: 'announcement',
        name: 'Announcement',
        component: Announcement
      },
      {
        path: 'product',
        name: 'Product',
        component: Product
      },
      {
        path: 'forum',
        name: 'Forum',
        component: Forum
      },
      {
        path: 'news',
        name: 'News',
        component: News
      },
      {
        path: 'cart',
        name: 'Cart',
        component: Cart
      },
      {
        path: 'culture',
        name: 'Culture',
        component: Culture
      },
      {
        path: 'my',
        name: 'My',
        component: My
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user_token')
  const expiry = localStorage.getItem('token_expiry')
  const isTokenValid = token && expiry && new Date().getTime() <= parseInt(expiry)

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isTokenValid) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router