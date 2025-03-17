<template>
  <div class="main-layout">
    <!-- 顶部标题栏 -->
    <header class="header">
      <div class="title">非物质文化遗产平台</div>
      <div class="date-info">
        <div class="solar-date">{{ solarDate }}</div>
      </div>
      <div class="user-info">
        <el-icon size="20"><User /></el-icon>
        <span v-if="!isTokenValid" class="login-text" @click="handleLogin">登录</span>
        <el-button v-if="isTokenValid" type="danger" size="small" plain @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </header>

    <!-- 导航标签页 -->
    <nav class="nav-tabs">
      <router-link
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
        class="nav-tab"
        active-class="active"
      >
        {{ route.name }}
      </router-link>
    </nav>

    <!-- 内容区域 -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '../store/user.js'

const router = useRouter()
const solarDate = ref('')

const routes = [
  { path: '/user', name: '用户管理' },
  { path: '/admin', name: '管理员管理' },
  { path: '/carousel', name: '轮播图管理' },
  { path: '/announcement', name: '公告栏管理' },
  { path: '/news', name: '非遗资讯管理' },
  { path: '/forum', name: '论坛交流管理' },
  { path: '/products', name: '文创商品管理' },
  { path: '/orders', name: '订单管理' },
  { path: '/culture', name: '非遗文化管理' },
  { path: '/application', name: '非遗申请管理' }
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.date-info {
  text-align: right;
}

.solar-date {
  margin: 0.2rem 0;
  color: #666;
  font-size: 1.1rem;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  overflow-x: auto;
}

.nav-tab {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #666;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-tab:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
  transform: translateY(-2px);
}

.nav-tab.active {
  background: #1890ff;
  color: white;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: #f5f5f5;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-text {
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.login-text:hover {
  color: #1890ff;
}
</style>
