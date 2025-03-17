<template>
  <div class="main-layout">
    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="logo-container">
        <div class="title">非物质文化遗产平台</div>
      </div>
      <div class="nav-tabs">
        <router-link
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
          class="nav-tab"
          active-class="active"
        >
          {{ route.name }}
        </router-link>
      </div>
      <div class="right-section">
        <div class="date-info">
          <div class="solar-date">{{ solarDate }}</div>
        </div>
        <div class="user-info">
          <el-icon size="20"><User /></el-icon>
          <span v-if="!isTokenValid" class="login-text" @click="handleLogin">登录</span>
          <el-dropdown v-else>
            <span class="user-dropdown">
              <span class="username">{{ username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/my')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 内容区域 -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '../store/user.js'

const router = useRouter()
const userStore = useUserStore()
const solarDate = ref('')

// 获取用户名
const username = computed(() => {
  return userStore.userInfo?.username || '用户'
})

const routes = [
  { path: '/home', name: '首页' },
  { path: '/announcement', name: '公告栏' },
  { path: '/product', name: '文创商品' },
  { path: '/forum', name: '论坛交流' },
  { path: '/news', name: '非遗资讯' },
  { path: '/culture', name: '非遗文化' },
  { path: '/cart', name: '购物车' },
  { path: '/my', name: '我的' },
]

const updateDate = () => {
  const now = new Date()
  solarDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

onMounted(() => {
  updateDate()
  // 每分钟更新一次日期
  setInterval(updateDate, 60000)
})

// 检查token是否存在且未过期
const token = localStorage.getItem('user_token')
const expiry = localStorage.getItem('token_expiry')
const isTokenValid = ref(token && expiry && new Date().getTime() <= parseInt(expiry))

// 处理登录点击
const handleLogin = () => {
  router.push('/login')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确认退出登录吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const userStore = useUserStore()
      // 清除用户信息
      userStore.clearUserInfo()
      // 清除本地存储
      localStorage.removeItem('user_token')
      localStorage.removeItem('token_expiry')
      isTokenValid.value = false
      ElMessage.success('退出登录成功')
      // 跳转到登录页
      router.push('/login')
    } catch (error) {
      console.error("退出登录失败:", error)
      ElMessage.error('退出登录失败，请重试')
    }
  }).catch(() => {
    // 取消退出时不做任何操作
  })
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 64px;
  background: linear-gradient(135deg, #ffffff, #f5f5f5);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40px;
  width: auto;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  background: linear-gradient(45deg, #1890ff, #722ed1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.date-info {
  text-align: right;
}

.solar-date {
  color: #666;
  font-size: 0.9rem;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.nav-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.nav-tab {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #555;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: 500;
}

.nav-tab:hover {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.nav-tab.active {
  background: #1890ff;
  color: white;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-text {
  cursor: pointer;
  color: #1890ff;
  transition: color 0.3s;
  font-weight: 500;
}

.login-text:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  font-weight: 500;
  color: #333;
}
</style>
