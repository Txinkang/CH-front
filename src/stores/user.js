import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: localStorage.getItem('user_token') || null,
    tokenExpiry: localStorage.getItem('token_expiry') || null
  }),
  
  getters: {
    isLoggedIn: (state) => {
      return state.token && state.tokenExpiry && new Date().getTime() <= parseInt(state.tokenExpiry)
    }
  },
  
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    
    setToken(token, expiry) {
      this.token = token
      this.tokenExpiry = expiry
      localStorage.setItem('user_token', token)
      localStorage.setItem('token_expiry', expiry)
    },
    
    clearUserInfo() {
      this.userInfo = null
      this.token = null
      this.tokenExpiry = null
      localStorage.removeItem('user_token')
      localStorage.removeItem('token_expiry')
    }
  }
}) 