<template>
  <div class="carousel-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入轮播图名称搜索"
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
        创建轮播图
      </el-button>
    </div>

    <!-- 轮播图卡片列表 -->
    <div class="banner-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="banner in banners" :key="banner.bannerId">
          <el-card class="banner-card" shadow="hover">
            <div class="banner-info">
              <div class="banner-image">
                <el-image
                  :src="getImageUrl(banner.bannerImage)"
                  fit="cover"
                  :preview-src-list="[getImageUrl(banner.bannerImage)]"
                />
              </div>
              <div class="info-item">
                <span class="label">名称：</span>
                <span class="value">{{ banner.bannerName }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button type="primary" size="small" @click="handleEdit(banner)">
                <el-icon><Edit /></el-icon>
                修改
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(banner)">
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

    <!-- 创建/编辑轮播图对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑轮播图' : '创建轮播图'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="formData.bannerName" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            class="banner-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <img v-if="imageUrl" :src="imageUrl" class="uploaded-image" />
            <el-icon v-else class="banner-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 jpg、jpeg、png 格式，大小不超过 10MB</div>
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
import { bannerApi } from '../api/banner'
import { errorHandler } from '../utils/errorHandler.js'

// 搜索相关
const searchKeyword = ref('')
const handleSearch = () => {
  currentPage.value = 1
  fetchBanners()
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchBanners()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchBanners()
}

// 轮播图数据
const banners = ref([])
const fetchBanners = async () => {
  try {
    const requestData = {
      banner_name: searchKeyword.value,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取轮播图请求数据：", requestData)
    const response = await bannerApi.getBanner(requestData)
    if (response.code === 200) {
      banners.value = response.data.data
      total.value = response.data.total_item
      console.log("获取轮播图响应数据：", response)
    } else {
      errorHandler.showError('获取轮播图列表失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取轮播图列表错误', error)
  }
}

// 图片处理
const getImageUrl = (image) => {
  return `http://localhost:8080/images/bannerPictures/${image}`
}

const imageUrl = ref('')
const uploadedFile = ref(null)

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

  uploadedFile.value = file
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    imageUrl.value = reader.result
  }
  return false // 阻止自动上传
}

const handleUploadSuccess = (response) => {
  imageUrl.value = URL.createObjectURL(uploadedFile.value)
  ElMessage.success('图片上传成功')
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败')
}

// 对话框相关
const dialogVisible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formData = ref({
  bannerId: '',
  bannerName: '',
})

// 创建轮播图
const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    bannerId: '',
    bannerName: '',
  }
  imageUrl.value = ''
  uploadedFile.value = null
  dialogVisible.value = true
}

// 编辑轮播图
const handleEdit = (banner) => {
  isEdit.value = true
  formData.value = {
    bannerId: banner.bannerId,
    bannerName: banner.bannerName,
  }
  imageUrl.value = getImageUrl(banner.bannerImage)
  uploadedFile.value = null
  dialogVisible.value = true
}

// 确认对话框
const confirmDialog = async () => {
  if (!formData.value.bannerName.trim()) {
    ElMessage.warning('请输入轮播图名称')
    return
  }
  if (!isEdit.value && !uploadedFile.value) {
    ElMessage.warning('请上传轮播图图片')
    return
  }

  loading.value = true
  try {
    const formDataObj = new FormData()
    formDataObj.append('banner_name', formData.value.bannerName)
    if (uploadedFile.value) {
      formDataObj.append('banner_image', uploadedFile.value)
    }
    if (isEdit.value) {
      formDataObj.append('banner_id', formData.value.bannerId)
    }
    console.log("创建/修改轮播图请求数据：", formDataObj)
    const response = isEdit.value
      ? await bannerApi.updateBanner(formDataObj)
      : await bannerApi.addBanner(formDataObj)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
      dialogVisible.value = false
      console.log("创建/修改轮播图响应数据：", response)
      fetchBanners()
    } else if (response.code === 414) {
      errorHandler.showError('轮播图名称已存在', response)
    } else {
      errorHandler.showError(isEdit.value ? '修改轮播图失败' : '创建轮播图失败', response)
    }
  } catch (error) {
    errorHandler.showError(isEdit.value ? '修改轮播图错误' : '创建轮播图错误', error)
  } finally {
    loading.value = false
  }
}

// 删除轮播图
const handleDelete = (banner) => {
  ElMessageBox.confirm(
    '确认删除轮播图 "' + banner.bannerName + '" 吗？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const requestData = {
        banner_id: banner.bannerId
      }
      const response = await bannerApi.deleteBanner(requestData)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        fetchBanners()
      } else {
        errorHandler.showError('删除轮播图失败', response)
      }
    } catch (error) {
      errorHandler.showError('删除轮播图错误', error)
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 初始化
onMounted(() => {
  fetchBanners()
})
</script>

<style scoped>
.carousel-management {
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

.banner-cards {
  margin-bottom: 24px;
}

.banner-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.banner-card:hover {
  transform: translateY(-4px);
}

.banner-info {
  margin-bottom: 16px;
}

.banner-image {
  width: 100%;
  height: 200px;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.banner-image :deep(.el-image) {
  width: 100%;
  height: 100%;
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

.banner-uploader {
  width: 100%;
}

.banner-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.banner-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.banner-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 200px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.uploaded-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}
</style> 