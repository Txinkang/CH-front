<!-- src/views/CultureManagement.vue -->
<template>
    <div class="culture-management">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入项目标题搜索"
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
  
      <!-- 文化项目表格 -->
      <el-table
        :data="cultures"
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
                  class="culture-image"
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
  
        <el-table-column label="更新时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
  
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              修改
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        title="编辑项目"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form :model="formData" label-width="80px">
          <el-form-item label="标题" required>
            <el-input v-model="formData.projectTitle" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="内容" required>
            <el-input
              v-model="formData.projectContent"
              type="textarea"
              :rows="6"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="图片">
            <el-upload
              ref="uploadRef"
              class="culture-uploader"
              :show-file-list="true"
              :before-upload="beforeUpload"
              :on-remove="handleRemove"
              :on-change="handleChange"
              multiple
              action="#"
              :auto-upload="false"
              :limit="5"
            >
              <el-button type="primary">选择图片</el-button>
              <template #tip>
                <div class="upload-tip">支持 jpg、jpeg、png 格式，大小不超过 10MB，最多 5 张</div>
              </template>
            </el-upload>
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
  import { Search, Edit, Delete } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { cultureApi } from '../api/culture'
  import { errorHandler } from '../utils/errorHandler.js'
  
  // 搜索相关
  const searchKeyword = ref('')
  const handleSearch = () => {
    currentPage.value = 1
    fetchCultures()
  }
  
  // 分页相关
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  
  const handleSizeChange = (val) => {
    pageSize.value = val
    fetchCultures()
  }
  
  const handleCurrentChange = (val) => {
    currentPage.value = val
    fetchCultures()
  }
  
  // 文化项目数据
  const cultures = ref([])
  const tableLoading = ref(false)
  
  const fetchCultures = async () => {
    tableLoading.value = true
    try {
      const requestData = {
        project_title: searchKeyword.value,
        page_num: currentPage.value,
        page_size: pageSize.value
      }
      const response = await cultureApi.getCultures(requestData)
      if (response.code === 200) {
        cultures.value = response.data.data.map(item => ({
          ...item,
          showContent: false,
          imageList: item.projectImage ? item.projectImage.split('|').filter(Boolean) : []
        }))
        total.value = response.data.total_item
      } else {
        errorHandler.showError('获取非遗文化列表失败', response)
      }
    } catch (error) {
      errorHandler.showError('获取非遗文化列表错误', error)
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
    console.log(material)
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
      case 2: return '审核成功'
      case 3: return '审核失败'
      default: return '未知状态'
    }
  }
  
  // 切换内容显示
  const toggleContent = (row) => {
    row.showContent = !row.showContent
  }
  
  // 对话框相关
  const dialogVisible = ref(false)
  const loading = ref(false)
  const formData = ref({
    projectId: '',
    projectTitle: '',
    projectContent: ''
  })
  
  // 图片上传相关
  const uploadFiles = ref([])
  const uploadRef = ref(null)
  
  const beforeUpload = (file) => {
    const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    const isLt10M = file.size / 1024 / 1024 < 10
  
    if (!isValidType) {
      ElMessage.error('只能上传 jpg、jpeg、png 格式的图片！')
      return false
    }
    if (!isLt10M) {
      ElMessage.error('图片大小不能超过 10MB！')
      return false
    }
  
    return true
  }
  
  const handleRemove = (file) => {
    const index = uploadFiles.value.indexOf(file)
    if (index !== -1) {
      uploadFiles.value.splice(index, 1)
    }
  }
  
  const handleChange = (file, fileList) => {
    uploadFiles.value = fileList
  }
  
  // 编辑项目
  const handleEdit = (culture) => {
    formData.value = {
      projectId: culture.projectId,
      projectTitle: culture.projectTitle,
      projectContent: culture.projectContent
    }
    uploadFiles.value = []
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    dialogVisible.value = true
  }
  
  // 确认对话框
  const confirmDialog = async () => {
    if (!formData.value.projectTitle.trim()) {
      ElMessage.warning('请输入项目标题')
      return
    }
    if (!formData.value.projectContent.trim()) {
      ElMessage.warning('请输入项目内容')
      return
    }
  
    loading.value = true
    try {
      const formDataObj = new FormData()
      formDataObj.append('project_id', formData.value.projectId)
      formDataObj.append('project_title', formData.value.projectTitle)
      formDataObj.append('project_content', formData.value.projectContent)
      
      uploadFiles.value.forEach(file => {
        formDataObj.append('project_image', file.raw)
      })
  
      const response = await cultureApi.updateCulture(formDataObj)
      if (response.code === 200) {
        ElMessage.success('修改成功')
        dialogVisible.value = false
        fetchCultures()
      } else {
        errorHandler.showError('修改项目失败', response)
      }
    } catch (error) {
      errorHandler.showError('修改项目错误', error)
    } finally {
      loading.value = false
    }
  }
  
  // 删除项目
  const handleDelete = (culture) => {
    ElMessageBox.confirm(
      '确认删除项目 "' + culture.projectTitle + '" 吗？',
      '警告',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        const requestData = {
          project_id: culture.projectId
        }
        const response = await cultureApi.deleteCulture(requestData)
        if (response.code === 200) {
          ElMessage.success('删除成功')
          fetchCultures()
        } else {
          errorHandler.showError('删除项目失败', response)
        }
      } catch (error) {
        errorHandler.showError('删除项目错误', error)
      }
    }).catch(() => {
      // 取消删除，不做任何操作
    })
  }
  
  // 初始化
  onMounted(() => {
    fetchCultures()
  })
  </script>
  
  <style scoped>
  .culture-management {
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
  
  .culture-image {
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
  
  .upload-tip {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
  }
  </style>