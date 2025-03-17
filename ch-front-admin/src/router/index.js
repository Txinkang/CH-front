import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../Layout/MainLayout.vue'
import Login from '../views/Login.vue'
import UserManagement from '../views/UserManagement.vue'
import AdminManagement from '../views/AdminManagement.vue'
import CarouselManagement from '../views/CarouselManagement.vue'
import AnnouncementManagement from '../views/AnnouncementManagement.vue'
import NewsManagement from '../views/NewsManagement.vue'
import ForumManagement from '../views/ForumManagement.vue'
import ProductManagement from '../views/ProductManagement.vue'
import OrderManagement from '../views/OrderManagement.vue'
import CultureManagement from '../views/CultureManagement.vue'
import ApplicationManagement from '../views/ApplicationManagement.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/user',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: UserManagement
      },
      {
        path: 'admin',
        name: 'AdminManagement',
        component: AdminManagement
      },
      {
        path: 'carousel',
        name: 'CarouselManagement',
        component: CarouselManagement
      },
      {
        path: 'announcement',
        name: 'AnnouncementManagement',
        component: AnnouncementManagement
      },
      {
        path: 'news',
        name: 'NewsManagement',
        component: NewsManagement
      },
      {
        path: 'forum',
        name: 'ForumManagement',
        component: ForumManagement
      },
      {
        path: 'products',
        name: 'ProductManagement',
        component: ProductManagement
      },
      {
        path: 'orders',
        name: 'OrderManagement',
        component: OrderManagement
      },
      {
        path: 'culture',
        name: 'CultureManagement',
        component: CultureManagement
      },
      {
        path: 'application',
        name: 'ApplicationManagement',
        component: ApplicationManagement
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