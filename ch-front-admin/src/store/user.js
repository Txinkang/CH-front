import { defineStore } from 'pinia'
import MagicMathData from '@/constant/MagicMathData.js'
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
  }),

  getters: {
    isLoggedIn: (state) => {
      return state.isTokenValid()
    },

  },

  actions: {
    // 设置带过期时间的 token
    setTokenWithExpiry(token) {
      const tokenInfo = {
        value: token,
        expiry: new Date().getTime() + MagicMathData.tokenExpiry // 3天后过期
      }
      // 分开存储 token 和过期时间
      localStorage.setItem('user_token', token)
      localStorage.setItem('token_expiry', tokenInfo.expiry.toString())
      this.token = token
    },

    // 获取 token（如果过期返回 null）
    getToken() {
      const token = localStorage.getItem('user_token')
      const expiry = localStorage.getItem('token_expiry')

      if (!token || !expiry) return null

      if (new Date().getTime() > parseInt(expiry)) {
        // token 已过期，清除信息
        this.clearUserInfo()
        return null
      }
      return token
    },

    // 设置用户信息
    setUserInfo(data) {
      // 设置带过期时间的 token
      this.setTokenWithExpiry(data)
    },

    // 清除用户信息
    clearUserInfo() {
      this.token = ''

      localStorage.removeItem('user_token')
      localStorage.removeItem('token_expiry')
    },

    // 检查 token 是否有效
    isTokenValid() {
      return !!this.getToken()
    }
  },

  // 开启数据持久化
  persist: true
})
