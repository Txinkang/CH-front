<!-- src/views/ApplicationManagement.vue -->
<template>
    <div class="application-management">
      <!-- 申请表格 -->
      <el-table
        :data="applications"
        style="width: 100%"
        v-loading="tableLoading"
      >
        <el-table-column prop="projectTitle" label="标题" min-width="150" />
        
        <el-table-column label="项目图片" min-width="200">
          <template #default="{ row }">
            <el-carousel 
              height="150px" 
              indicator-position="outside"
              :autoplay="false"
              trigger="click"
              v-if="row.imageList && row.imageList.length > 0"
            >
              <el-carousel-item v-for="image in row.imageList" :key="image">
                <el-image
                  :src="getImageUrl(image)"
                  fit="contain"
                  :preview-src-list="row.imageList.map(img => getImageUrl(img))"
                  class="application-image"
                />
              </el-carousel-item>
            </el-carousel>
            <div v-else class="no-image">暂无图片</div>
          </template>
        </el-table-column>
  
        <el-table-column label="内容" min-width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="toggleContent(row)">
              {{ row.showContent ? '收起' : '查看' }}
            </el-button>
            <div v-if="row.showContent" class="content-preview">
              {{ row.projectContent }}
            </div>
          </template>
        </el-table-column>
  
        <el-table-column label="申报材料" min-width="120">
          <template #default="{ row }">
            <el-link 
              v-if="row.projectMaterial"
              type="primary" 
              :href="getMaterialUrl(row.projectMaterial)"
              target="_blank"
            >
              下载材料
            </el-link>
            <span v-else>暂无材料</span>
          </template>
        </el-table-column>
  
        <el-table-column label="审核状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
  
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
  
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="success" 
              size="small" 
              @click="handleAudit(row, 2)"
              :disabled="row.status !== 1"
            >
              通过
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleReject(row)"
              :disabled="row.status !== 1"
            >
              不通过
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
        <el-button type="primary" @click="fetchApplications">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
  
      <!-- 不通过原因对话框 -->
      <el-dialog
        v-model="rejectDialogVisible"
        title="请输入不通过原因"
        width="500px"
      >
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="4"
          placeholder="请输入不通过原因"
        />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="rejectDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmReject" :loading="loading">
              确认
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { applicationApi } from '../api/application'
  import { errorHandler } from '../utils/errorHandler.js'
  import { Search } from '@element-plus/icons-vue'
  
  // 分页相关
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  
  const handleSizeChange = (val) => {
    pageSize.value = val
    fetchApplications()
  }
  
  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchApplications()
  }
  
  // 申请数据
  const applications = ref([])
  const tableLoading = ref(false)
  
  const fetchApplications = async () => {
    tableLoading.value = true
    try {
      const requestData = {
        page_num: currentPage.value,
        page_size: pageSize.value
      }
      const response = await applicationApi.getApplications(requestData)
      if (response.code === 200) {
        applications.value = response.data.map(item => ({
          ...item,
          showContent: false,
          imageList: item.projectImage ? item.projectImage.split('|').filter(Boolean) : []
        }))
        total.value = response.data.length
      } else {
        errorHandler.showError('获取申请列表失败', response)
      }
    } catch (error) {
      errorHandler.showError('获取申请列表错误', error)
    } finally {
      tableLoading.value = false
    }
  }
  
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }
  
  // 获取图片URL
  const getImageUrl = (image) => {
    return `http://localhost:8080/images/heritagePictures/${image}`
  }
  
  // 获取材料URL
  const getMaterialUrl = (material) => {
    return `http://localhost:8080/images/heritageMaterial/${material}`
  }
  
  // 状态相关
  const getStatusType = (status) => {
    switch (status) {
      case 1: return 'warning'
      case 2: return 'success'
      case 3: return 'danger'
      default: return 'info'
    }
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 1: return '审核中'
      case 2: return '审核通过'
      case 3: return '审核不通过'
      default: return '未知状态'
    }
  }
  
  // 切换内容显示
  const toggleContent = (row) => {
    row.showContent = !row.showContent
  }
  
  // 审核相关
  const loading = ref(false)
  const rejectDialogVisible = ref(false)
  const rejectReason = ref('')
  const currentApplication = ref(null)
  
  const handleAudit = async (application, status) => {
    try {
      const requestData = {
        projectId: application.projectId,
        status: status
      }
      const response = await applicationApi.auditApplication(requestData)
      if (response.code === 200) {
        ElMessage.success('审核成功')
        fetchApplications()
      } else {
        errorHandler.showError('审核失败', response)
      }
    } catch (error) {
      errorHandler.showError('审核错误', error)
    }
  }
  
  const handleReject = (application) => {
    currentApplication.value = application
    rejectReason.value = ''
    rejectDialogVisible.value = true
  }
  
  const confirmReject = async () => {
    if (!rejectReason.value.trim()) {
      ElMessage.warning('请输入不通过原因')
      return
    }
  
    loading.value = true
    try {
      const requestData = {
        projectId: currentApplication.value.projectId,
        status: 3,
        auditResponse: rejectReason.value
      }
      const response = await applicationApi.auditApplication(requestData)
      if (response.code === 200) {
        ElMessage.success('审核成功')
        rejectDialogVisible.value = false
        fetchApplications()
      } else {
        errorHandler.showError('审核失败', response)
      }
    } catch (error) {
      errorHandler.showError('审核错误', error)
    } finally {
      loading.value = false
    }
  }
  
  // 初始化
  onMounted(() => {
    fetchApplications()
  })
  </script>
  
  <style scoped>
  .application-management {
    padding: 20px;
  }
  
  .application-image {
    width: 100%;
    height: 150px;
  }
  
  .no-image {
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    color: #909399;
  }
  
  .content-preview {
    margin-top: 8px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }
  </style>