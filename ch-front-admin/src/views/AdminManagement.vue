<template>
  <div class="admin-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入管理员账号搜索"
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
      <el-button type="success" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建管理员
      </el-button>
    </div>

    <!-- 管理员卡片列表 -->
    <div class="admin-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="admin in admins" :key="admin.adminId">
          <el-card class="admin-card" shadow="hover">
            <div class="admin-info">
              <div class="info-item">
                <span class="label">账号：</span>
                <span class="value">{{ admin.adminAccount }}</span>
              </div>
              <div class="info-item">
                <span class="label">密码：</span>
                <span class="value">{{ admin.adminPassword }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click="handleEdit(admin)">
                <el-icon><Edit /></el-icon>
                修改
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(admin)">
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

    <!-- 创建/编辑管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑管理员信息' : '创建管理员'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="formData.adminAccount" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.adminPassword" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDialog" :loading="loading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '../api/admin'
import { errorHandler } from '../utils/errorHandler.js'

// 搜索相关
const searchKeyword = ref('')
const handleSearch = () => {
  currentPage.value = 1
  fetchAdmins()
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchAdmins()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchAdmins()
}

// 管理员数据
const admins = ref([])
const fetchAdmins = async () => {
  try {
    const requestData = {
      admin_account: searchKeyword.value,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    const response = await adminApi.getAdminInfo(requestData)
    if (response.code === 200) {
      admins.value = response.data.data
      total.value = response.data.total_item
    } else {
      errorHandler.showError('获取管理员列表失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取管理员列表错误', error)
  }
}

// 对话框相关
const dialogVisible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formData = ref({
  adminId: '',
  adminAccount: '',
  adminPassword: '',
})

// 创建管理员
const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    adminId: '',
    adminAccount: '',
    adminPassword: '',
  }
  dialogVisible.value = true
}

// 编辑管理员
const handleEdit = (admin) => {
  isEdit.value = true
  formData.value = { ...admin }
  dialogVisible.value = true
}

// 确认对话框
const confirmDialog = async () => {
  loading.value = true
  try {
    const requestData = {
      adminId: formData.value.adminId,
      adminAccount: formData.value.adminAccount,
      adminPassword: formData.value.adminPassword,
    }
    const response = isEdit.value
      ? await adminApi.updateAdmin(requestData)
      : await adminApi.createAdmin(requestData)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
      dialogVisible.value = false
      fetchAdmins()
    } else if (response.code === 402) {
      errorHandler.showError('账号已存在', response)
    } else {
      errorHandler.showError(isEdit.value ? '修改管理员失败' : '创建管理员失败', response)
    }
  } catch (error) {
    errorHandler.showError(isEdit.value ? '修改管理员错误' : '创建管理员错误', error)
  } finally {
    loading.value = false
  }
}

// 删除管理员
const handleDelete = (admin) => {
  ElMessageBox.confirm(
    '确认删除管理员 "' + admin.adminAccount + '" 吗？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const requestData = {
        admin_id: admin.adminId
      }
      const response = await adminApi.deleteAdmin(requestData)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        fetchAdmins()
      } else {
        errorHandler.showError('删除管理员失败', response)
      }
    } catch (error) {
      errorHandler.showError('删除管理员错误', error)
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 初始化
onMounted(() => {
  fetchAdmins()
})
</script>

<style scoped>
.admin-management {
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

.admin-cards {
  margin-bottom: 24px;
}

.admin-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.admin-card:hover {
  transform: translateY(-4px);
}

.admin-info {
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