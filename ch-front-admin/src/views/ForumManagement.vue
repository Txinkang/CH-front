<template>
  <div class="forum-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入帖子标题搜索"
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
        创建帖子
      </el-button>
    </div>

    <!-- 帖子表格 -->
    <el-table
      :data="posts"
      style="width: 100%"
      v-loading="tableLoading"
    >
      <el-table-column prop="postTitle" label="标题" min-width="150" />
      
      <el-table-column label="内容" min-width="200">
        <template #default="{ row }">
          <el-button link type="primary" @click="toggleContent(row)">
            {{ row.showContent ? '收起' : '查看' }}
          </el-button>
          <div v-if="row.showContent" class="content-preview">
            {{ row.postContent }}
          </div>
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

    <!-- 创建/编辑帖子对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑帖子' : '创建帖子'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="formData.postTitle" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="formData.postContent"
            type="textarea"
            :rows="6"
            maxlength="500"
            show-word-limit
          />
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
import { forumApi } from '../api/forum'
import { errorHandler } from '../utils/errorHandler.js'

// 搜索相关
const searchKeyword = ref('')
const handleSearch = () => {
  currentPage.value = 1
  fetchPosts()
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchPosts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchPosts()
}

// 帖子数据
const posts = ref([])
const tableLoading = ref(false)

const fetchPosts = async () => {
  tableLoading.value = true
  try {
    const requestData = {
      post_title: searchKeyword.value,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取帖子列表请求数据：", requestData)
    const response = await forumApi.getPost(requestData)
    if (response.code === 200) {
      posts.value = response.data.data.map(item => ({
        ...item,
        showContent: false
      }))
      total.value = response.data.total_item
      console.log("获取帖子列表响应数据：", response)
    } else {
      errorHandler.showError('获取帖子列表失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取帖子列表错误', error)
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

// 切换内容显示
const toggleContent = (row) => {
  row.showContent = !row.showContent
}

// 对话框相关
const dialogVisible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formData = ref({
  postId: '',
  postTitle: '',
  postContent: ''
})

// 创建帖子
const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    postId: '',
    postTitle: '',
    postContent: ''
  }
  dialogVisible.value = true
}

// 编辑帖子
const handleEdit = (post) => {
  isEdit.value = true
  formData.value = {
    postId: post.postId,
    postTitle: post.postTitle,
    postContent: post.postContent
  }
  dialogVisible.value = true
}

// 确认对话框
const confirmDialog = async () => {
  if (!formData.value.postTitle.trim()) {
    ElMessage.warning('请输入帖子标题')
    return
  }
  if (!formData.value.postContent.trim()) {
    ElMessage.warning('请输入帖子内容')
    return
  }

  loading.value = true
  try {
    const requestData = {
      postId: formData.value.postId,
      postTitle: formData.value.postTitle,
      postContent: formData.value.postContent
    }
    console.log("创建/修改帖子请求数据：", requestData)
    const response = isEdit.value
      ? await forumApi.updatePost(requestData)
      : await forumApi.addPost(requestData)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
      dialogVisible.value = false
      console.log("创建/修改帖子响应数据：", response)
      fetchPosts()
    } else if (response.code === 414) {
      errorHandler.showError('帖子标题已存在', response)
    } else {
      errorHandler.showError(isEdit.value ? '修改帖子失败' : '创建帖子失败', response)
    }
  } catch (error) {
    errorHandler.showError(isEdit.value ? '修改帖子错误' : '创建帖子错误', error)
  } finally {
    loading.value = false
  }
}

// 删除帖子
const handleDelete = (post) => {
  ElMessageBox.confirm(
    '确认删除帖子 "' + post.postTitle + '" 吗？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const requestData = {
        post_id: post.postId
      }
      const response = await forumApi.deletePost(requestData)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        fetchPosts()
      } else {
        errorHandler.showError('删除帖子失败', response)
      }
    } catch (error) {
      errorHandler.showError('删除帖子错误', error)
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 初始化
onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.forum-management {
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
</style> 