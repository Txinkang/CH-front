<template>
  <div class="culture">
    <el-tabs v-model="activeTab">
      <!-- 非遗文化展示标签页 -->
      <el-tab-pane label="非遗文化" name="list">
        <!-- 搜索区域 -->
        <div class="search-area">
          <el-input
            v-model="searchForm.project_title"
            placeholder="请输入项目名称"
            class="search-input"
            clearable
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>

        <!-- 项目列表 -->
        <div class="projects-list">
          <el-card v-for="project in projects" :key="project.projectId" class="project-card">
            <template #header>
              <div class="card-header">
                <h3>{{ project.projectTitle }}</h3>
                <span class="time">{{ formatDate(project.createdAt) }}</span>
              </div>
            </template>
            
            <!-- 项目内容 -->
            <el-collapse>
              <el-collapse-item>
                <template #title>
                  <span class="content-preview">{{ project.projectContent.substring(0, 50) }}...</span>
                </template>
                
                <!-- 展开后的详细内容 -->
                <div class="project-detail">
                  <!-- 图片轮播 -->
                  <el-carousel height="300px" indicator-position="outside" :interval="4000">
                    <el-carousel-item v-for="(image, index) in getProjectImages(project.projectImage)" :key="index">
                      <img :src="getImageUrl(image)" :alt="project.projectTitle" class="project-image">
                    </el-carousel-item>
                  </el-carousel>
                  
                  <!-- 项目描述 -->
                  <div class="project-content">
                    {{ project.projectContent }}
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
            layout="total, prev, pager, next"
          />
        </div>
      </el-tab-pane>

      <!-- 申请非遗文化标签页 -->
      <el-tab-pane label="申请非遗文化" name="apply">
        <div class="apply-form">
          <el-card>
            <el-form
              ref="applyFormRef"
              :model="applyForm"
              :rules="applyRules"
              label-width="120px"
              status-icon
            >
              <el-form-item label="项目名称" prop="project_title">
                <el-input v-model="applyForm.project_title" placeholder="请输入项目名称" />
              </el-form-item>

              <el-form-item label="项目内容" prop="project_content">
                <el-input
                  v-model="applyForm.project_content"
                  type="textarea"
                  :rows="4"
                  placeholder="请详细描述项目内容"
                />
              </el-form-item>

              <el-form-item label="项目图片" prop="project_image">
                <el-upload
                  v-model:file-list="imageFileList"
                  :auto-upload="false"
                  list-type="picture-card"
                  :on-change="handleImageChange"
                  :on-remove="handleImageRemove"
                  multiple
                  accept="image/*"
                >
                  <el-icon><Plus /></el-icon>
                  <template #tip>
                    <div class="el-upload__tip">
                      请选择图片文件
                    </div>
                  </template>
                </el-upload>
              </el-form-item>

              <el-form-item label="项目材料" prop="project_material">
                <el-upload
                  v-model:file-list="materialFileList"
                  :auto-upload="false"
                  :limit="1"
                  :on-change="handleMaterialChange"
                  :on-remove="handleMaterialRemove"
                  accept=".doc,.docx,.pdf,.zip,.rar"
                >
                  <el-button type="primary">选择材料</el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持 doc、pdf、zip、rar 格式，只能选择一个文件
                    </div>
                  </template>
                </el-upload>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitApplication">确认提交</el-button>
                <el-button @click="resetForm">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { cultureApi } from '../api/culture'
import { errorHandler } from '../utils/errorHandler'

// 数据定义
const activeTab = ref('list')
const projects = ref([])
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  project_title: '',
  page_num: 1,
  page_size: 5
})

// 申请表单
const applyFormRef = ref(null)
const applyForm = reactive({
  project_title: '',
  project_content: '',
  project_image: '',
  project_material: ''
})

// 文件列表
const imageFileList = ref([])
const materialFileList = ref([])

// 表单校验规则
const applyRules = {
  project_title: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  project_content: [
    { required: true, message: '请输入项目内容', trigger: 'blur' },
    { min: 10, max: 2000, message: '长度在 10 到 2000 个字符', trigger: 'blur' }
  ],
//   project_image: [
//     { required: true, message: '请上传项目图片', trigger: 'change' }
//   ],
//   project_material: [
//     { required: true, message: '请上传项目材料', trigger: 'change' }
//   ]
}

// 方法定义
const getProjectImages = (imageString) => {
  return imageString ? imageString.split('|').filter(img => img) : []
}

const getImageUrl = (image) => {
  return `http://localhost:8080/images/heritagePictures/${image}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchProjects()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchProjects()
}

// 文件处理
const handleImageChange = (file) => {
  // 验证文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  // 验证文件大小
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('图片大小不能超过 50MB！')
    return false
  }
  return true
}

const handleImageRemove = (file) => {
  const index = imageFileList.value.indexOf(file)
  if (index !== -1) {
    imageFileList.value.splice(index, 1)
  }
}

const handleMaterialChange = (file) => {
  // 验证文件类型
  const allowedTypes = ['.doc', '.docx', '.pdf', '.zip', '.rar']
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedTypes.includes(extension)) {
    ElMessage.error('只能上传 doc、pdf、zip、rar 格式的文件！')
    return false
  }
  // 验证文件大小
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB！')
    return false
  }
  return true
}

const handleMaterialRemove = () => {
  materialFileList.value = []
}

// API 调用方法
const fetchProjects = async () => {
  try {
    const params = {
      project_title: searchForm.project_title,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取非遗文化请求参数:", params);
    const response = await cultureApi.getProject(params)
    console.log("获取非遗文化响应数据:", response);
    if (response.code === 200) {
      projects.value = response.data.data
      total.value = response.data.total_item
    } else {
      errorHandler.showError("获取项目列表失败", response)
    }
  } catch (error) {
    errorHandler.showError('获取项目列表失败', error)
  }
}

const submitApplication = async () => {
  if (!applyFormRef.value) return

  try {
    await applyFormRef.value.validate()
    
    // 验证是否选择了文件
    if (imageFileList.value.length === 0) {
      ElMessage.error('请选择项目图片')
      return
    }
    if (materialFileList.value.length === 0) {
      ElMessage.error('请选择项目材料')
      return
    }

    // 创建 FormData
    const formData = new FormData()
    formData.append('project_title', applyForm.project_title)
    formData.append('project_content', applyForm.project_content)
    
    // 添加图片文件
    imageFileList.value.forEach((file) => {
      formData.append(`project_image`, file.raw)
    })
    
    // 添加材料文件
    formData.append('project_material', materialFileList.value[0].raw)

    console.log("申请非遗文化请求参数:", formData)
    const response = await cultureApi.HeritageApplication(formData)
    if (response.code === 200) {
      ElMessage.success('申请提交成功')
      console.log("申请非遗文化响应数据:", response)
      resetForm()
    } else {
      errorHandler.showError("申请提交失败", response.message)
    }
  } catch (error) {
    if (error.message) {
      errorHandler.showError('申请提交失败', error.message)
    }
  }
}

const resetForm = () => {
  if (applyFormRef.value) {
    applyFormRef.value.resetFields()
  }
  imageFileList.value = []
  materialFileList.value = []
  applyForm.project_image = ''
  applyForm.project_material = ''
}

// 初始化
fetchProjects()
</script>

<style scoped>
.culture {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-area {
  max-width: 500px;
  margin: 0 auto 30px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-card {
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.time {
  font-size: 14px;
  color: #999;
}

.content-preview {
  color: #666;
  font-size: 14px;
}

.project-detail {
  margin-top: 20px;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-content {
  margin-top: 20px;
  line-height: 1.6;
  color: #333;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.apply-form {
  max-width: 800px;
  margin: 0 auto;
}

:deep(.el-upload--picture-card) {
  width: 150px;
  height: 150px;
  line-height: 150px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style> 