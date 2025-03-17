<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <el-icon class="logo-icon" size="32"><Van /></el-icon>
                <h2 class="login-title">非物质文化遗产平台</h2>
                <p class="login-subtitle">管理员登录</p>
            </div>

            <el-form 
                :model="accountLoginForm" 
                class="login-form"
                @keyup.enter="submitAccountLoginForm"
            >
                <el-form-item>
                    <el-input
                        v-model="accountLoginForm.userName"
                        placeholder="请输入账号"
                        :prefix-icon="User"
                        clearable
                        size="large"
                    />
                </el-form-item>

                <el-form-item>
                    <el-input
                        v-model="accountLoginForm.userPassword"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        show-password
                        clearable
                        size="large"
                    />
                </el-form-item>

                <div class="form-actions">
                    <el-button 
                        type="primary" 
                        size="large" 
                        class="submit-btn"
                        :loading="loading"
                        @click="submitAccountLoginForm"
                        :disabled="!accountLoginForm.userName || !accountLoginForm.userPassword"
                    >
                        登录
                    </el-button>
                    <el-button 
                        size="large" 
                        class="reset-btn"
                        @click="resetAccountLoginForm"
                    >
                        重置
                    </el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>
  <script setup>
  import { reactive, ref } from "vue";
  import { useUserStore } from '../store/user.js';
  import router from "@/router/index.js";
  import { errorHandler } from '@/utils/errorHandler.js';
  import {userApi} from '../api/user.js';
  import { Van, User, Lock } from '@element-plus/icons-vue';

  defineOptions({
    name: 'LoginView'
  })

  const userStore = useUserStore()
  const loading = ref(false)

  // 账号登录
  const accountLoginForm = reactive({
    userName: "",
    userPassword: "",
  });
  const submitAccountLoginForm = async () => {
    if(!accountLoginForm.userName || !accountLoginForm.userPassword){
        errorHandler.showError('请输入账号和密码')
        return
    }
    
    loading.value = true
    try {
        const requestData = {
            adminAccount: accountLoginForm.userName,
            adminPassword: accountLoginForm.userPassword
        }
        console.log("账号登录请求数据：", requestData);
        const response = await userApi.login(requestData)
        if (response.code === 200) {
            // 存储用户信息到本地
            userStore.setUserInfo(response.data)
            router.replace("/user")
            console.log("账号登录成功,响应数据：", response);
        }else if(response.code === 405){
            errorHandler.showError('账号不存在', response)
        }else if(response.code === 406){
            errorHandler.showError('密码错误', response)
        }else{
            errorHandler.showError('未知错误,请重试', response)
        }
    } catch (err) {
      errorHandler.showError('登录错误', err)
    } finally {
      loading.value = false
    }
  }
  const resetAccountLoginForm = () => {
    accountLoginForm.userName = "";
    accountLoginForm.userPassword = "";
  }
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    /* background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(44, 82, 130, 0.1) 100%),
                url('/src/assets/image2.jpg') no-repeat center center fixed; */
    background-size: cover;
  }
  
  
  .login-box {
    width: 420px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(8px);
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .logo-icon {
    color: #409EFF;
    margin-bottom: 16px;
  }
  
  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px;
  }
  
  .login-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
  
  .login-form {
    margin-top: 24px;
  }
  
  .login-form :deep(.el-input) {
    --el-input-height: 44px;
    margin-bottom: 8px;
  }
  
  .login-form :deep(.el-input__wrapper) {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .login-form :deep(.el-input__inner) {
    font-size: 15px;
  }
  
  .form-actions {
    margin-top: 32px;
    display: flex;
    gap: 16px;
  }
  
  .submit-btn,
  .reset-btn {
    flex: 1;
    height: 44px;
    font-size: 16px;
  }
  
  .submit-btn {
    background: linear-gradient(to right, #409EFF, #2c5282);
    border: none;
  }
  
  .submit-btn:hover {
    background: linear-gradient(to right, #66b1ff, #3a6aa8);
    border: none;
  }
  
  .submit-btn:disabled {
    background: #a0cfff;
    border: none;
  }
  
  /* 响应式布局 */
  @media screen and (max-width: 480px) {
    .login-box {
      width: 90%;
      padding: 32px 24px;
    }
  
    .form-actions {
      flex-direction: column;
    }
  }
  </style>
  