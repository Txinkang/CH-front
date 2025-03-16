<template>
  <div class="product-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入商品名称搜索"
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
        创建商品
      </el-button>
    </div>

    <!-- 商品表格 -->
    <el-table
      :data="products"
      style="width: 100%"
      v-loading="tableLoading"
    >
      <el-table-column prop="productName" label="商品名称" min-width="120" />
      
      <el-table-column label="商品图片" min-width="200">
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
                class="product-image"
              />
            </el-carousel-item>
          </el-carousel>
          <div v-else class="no-image">暂无图片</div>
        </template>
      </el-table-column>

      <el-table-column label="商品简介" min-width="200">
        <template #default="{ row }">
          <el-button link type="primary" @click="toggleDescription(row)">
            {{ row.showDescription ? '收起' : '查看' }}
          </el-button>
          <div v-if="row.showDescription" class="description-preview">
            {{ row.productDescription }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="价格" min-width="100">
        <template #default="{ row }">
          ¥{{ row.productPrice.toFixed(2) }}
        </template>
      </el-table-column>

      <el-table-column label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="修改时间" min-width="180">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="info" size="small" @click="handleViewComments(row)">
            <el-icon><ChatDotRound /></el-icon>
            查看评价
          </el-button>
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

    <!-- 创建/编辑商品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '创建商品'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="formData.productName" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="简介" required>
          <el-input
            v-model="formData.productDescription"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input-number 
            v-model="formData.productPrice"
            :precision="2"
            :step="0.1"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            ref="uploadRef"
            class="product-uploader"
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

    <!-- 评价对话框 -->
    <el-dialog
      v-model="commentDialogVisible"
      title="商品评价"
      width="600px"
    >
      <div class="comments-container">
        <el-card 
          v-for="comment in comments" 
          :key="comment.productCommentId"
          class="comment-card" 
          shadow="hover"
        >
          <div class="comment-score">
            <span class="label">评分：</span>
            <el-rate
              v-model="comment.productScore"
              disabled
              show-score
              text-color="#ff9900"
            />
          </div>
          <div class="comment-content">
            <span class="label">评价：</span>
            <span class="content">{{ comment.productComment }}</span>
          </div>
          <div class="comment-time">
            {{ formatDate(comment.createdAt) }}
          </div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Edit, Delete, Plus, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi } from '../api/product'
import { errorHandler } from '../utils/errorHandler.js'

// 搜索相关
const searchKeyword = ref('')
const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchProducts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchProducts()
}

// 商品数据
const products = ref([])
const tableLoading = ref(false)

const fetchProducts = async () => {
  tableLoading.value = true
  try {
    const requestData = {
      product_name: searchKeyword.value,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取商品列表请求数据：", requestData)
    const response = await productApi.getProduct(requestData)
    if (response.code === 200) {
      products.value = response.data.data.map(item => ({
        ...item,
        showDescription: false,
        imageList: item.productImage ? item.productImage.split('|').filter(Boolean) : []
      }))
      total.value = response.data.total_item
      console.log("获取商品列表响应数据：", response)
    } else {
      errorHandler.showError('获取商品列表失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取商品列表错误', error)
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
  return `http://localhost:8080/images/productPictures/${image}`
}

// 切换描述显示
const toggleDescription = (row) => {
  row.showDescription = !row.showDescription
}

// 对话框相关
const dialogVisible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formData = ref({
  productId: '',
  productName: '',
  productDescription: '',
  productPrice: 0
})

// 图片上传相关
const uploadFiles = ref([])
const uploadRef = ref(null)

const beforeUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isValidType) {
    ElMessage.error('只能上传 jpg、jpeg、png 格式的图片！')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('图片大小不能超过 50MB！')
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

// 创建商品
const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    productId: '',
    productName: '',
    productDescription: '',
    productPrice: 0
  }
  uploadFiles.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (product) => {
  isEdit.value = true
  formData.value = {
    productId: product.productId,
    productName: product.productName,
    productDescription: product.productDescription,
    productPrice: product.productPrice
  }
  uploadFiles.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
  dialogVisible.value = true
}

// 确认对话框
const confirmDialog = async () => {
  if (!formData.value.productName.trim()) {
    ElMessage.warning('请输入商品名称')
    return
  }
  if (!formData.value.productDescription.trim()) {
    ElMessage.warning('请输入商品简介')
    return
  }
  if (formData.value.productPrice <= 0) {
    ElMessage.warning('请输入正确的商品价格')
    return
  }
  if (!isEdit.value && uploadFiles.value.length === 0) {
    console.log("请上传商品图片",uploadFiles.value)
    ElMessage.warning('请上传商品图片')
    return
  }

  loading.value = true
  try {
    const formDataObj = new FormData()
    formDataObj.append('product_name', formData.value.productName)
    formDataObj.append('product_description', formData.value.productDescription)
    formDataObj.append('product_price', formData.value.productPrice)
    
    if (isEdit.value) {
      formDataObj.append('product_id', formData.value.productId)
    }
    uploadFiles.value.forEach(file => {
      formDataObj.append('product_image', file.raw)
    })

    console.log("创建/修改商品请求数据：", formDataObj)
    const response = isEdit.value
      ? await productApi.updateProduct(formDataObj)
      : await productApi.addProduct(formDataObj)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
      dialogVisible.value = false
      console.log("创建/修改商品响应数据：", response)
      fetchProducts()
    } else if (response.code === 414) {
      errorHandler.showError('商品名称已存在', response)
    } else {
      errorHandler.showError(isEdit.value ? '修改商品失败' : '创建商品失败', response)
    }
  } catch (error) {
    errorHandler.showError(isEdit.value ? '修改商品错误' : '创建商品错误', error)
  } finally {
    loading.value = false
  }
}

// 删除商品
const handleDelete = (product) => {
  ElMessageBox.confirm(
    '确认删除商品 "' + product.productName + '" 吗？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const requestData = {
        product_id: product.productId
      }
      const response = await productApi.deleteProduct(requestData)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        fetchProducts()
      } else {
        errorHandler.showError('删除商品失败', response)
      }
    } catch (error) {
      errorHandler.showError('删除商品错误', error)
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 评价相关
const commentDialogVisible = ref(false)
const comments = ref([])

const handleViewComments = async (product) => {
  try {
    const requestData = {
      product_id: product.productId,
      page_num: 1,
      page_size: 3
    }
    console.log("获取商品评价请求数据：", requestData)
    const response = await productApi.getProductComments(requestData)
    if (response.code === 200) {
      comments.value = response.data
      commentDialogVisible.value = true
      console.log("获取商品评价响应数据：", response)
    } else {
      errorHandler.showError('获取商品评价失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取商品评价错误', error)
  }
}

// 初始化
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-management {
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

.product-image {
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

.description-preview {
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

.comments-container {
  max-height: 600px;
  overflow-y: auto;
  padding: 16px;
}

.comment-card {
  margin-bottom: 16px;
  padding: 16px;
}

.comment-score,
.comment-content {
  margin-bottom: 12px;
}

.comment-score .label,
.comment-content .label {
  color: #666;
  margin-right: 8px;
  font-weight: 500;
}

.comment-content .content {
  white-space: pre-wrap;
  word-break: break-all;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 8px;
}
</style> 