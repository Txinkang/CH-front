<template>
  <div class="user-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入用户账号搜索"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- 用户卡片列表 -->
    <div class="user-cards">
      <el-row :gutter="20" >
        <el-col :span="6" v-for="user in users" :key="user.userId">
          <el-card class="user-card" shadow="hover">
            <div class="user-info">
              <div class="info-item">
                <span class="label">账号：</span>
                <span class="value">{{ user.userAccount }}</span>
              </div>
              <div class="info-item">
                <span class="label">密码：</span>
                <span class="value">{{ user.userPassword }}</span>
              </div>
              <div class="info-item">
                <span class="label">余额：</span>
                <span class="value">￥{{ user.userBalance.toFixed(2) }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click="handleEdit(user)">
                <el-icon><Edit /></el-icon>
                修改
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(user)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[8, 16, 24, 32]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户信息"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="editForm.userAccount" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="editForm.userPassword" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEdit" :loading="editLoading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '../api/user'
import { errorHandler } from '../utils/errorHandler.js';
// 搜索相关
const searchKeyword = ref('')
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

// 用户数据
const users = ref([])
const fetchUsers = async () => {
  try {
    const requestData = {
      user_account: searchKeyword.value,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    const response = await userApi.getUserInfo(requestData)
    if (response.code === 200) {
      users.value = response.data.data
      total.value = response.data.total_item
    } else {
        errorHandler.showError('获取用户列表失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取用户列表错误', error)
  }
}

// 编辑用户
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({
  userId: '',
  userAccount: '',
  userPassword: '',
})

const handleEdit = (user) => {
  editForm.value = { ...user }
  editDialogVisible.value = true
}

const confirmEdit = async () => {
  editLoading.value = true
  try {
    const requestData = {
      userId: editForm.value.userId,
      userAccount: editForm.value.userAccount,
      userPassword: editForm.value.userPassword,
    }
    const response = await userApi.updateUser(requestData)
    console.log("修改用户请求数据：", requestData)
    if (response.code === 200) {
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      console.log("修改用户响应数据：", response)
      fetchUsers()
    } else {
      errorHandler.showError('修改用户失败', response)
    }
  } catch (error) {
    errorHandler.showError('修改用户信息错误', error)
  } finally {
    editLoading.value = false
  }
}

// 删除用户
const handleDelete = (user) => {
  ElMessageBox.confirm(
    '确认删除用户 "' + user.userAccount + '" 吗？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const requestData = {
        user_id: user.userId
      }
      const response = await userApi.deleteUser(requestData)
      console.log("删除用户请求数据：", requestData)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        fetchUsers()
        console.log("删除用户响应数据：", response)
      } else {
        errorHandler.showError('删除用户失败', response)
      }
    } catch (error) {
      errorHandler.showError('删除用户错误', error)
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 初始化
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
  align-items: center;
}

.search-input {
  width: 300px;
  height: 50px;
}

.user-cards {
  margin-bottom: 24px;
}

.user-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-4px);
}

.user-info {
  margin-bottom: 16px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  width: 60px;
}

.value {
  color: #333;
  flex: 1;
  word-break: break-all;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 