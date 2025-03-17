<template>
  <div class="announcement-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入公告标题搜索"
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
        创建公告
      </el-button>
    </div>

    <!-- 公告表格 -->
    <el-table
      :data="announcements"
      style="width: 100%"
      v-loading="tableLoading"
    >
      <el-table-column prop="announcementTitle" label="标题" min-width="150" />
      
      <el-table-column label="内容" min-width="200">
        <template #default="{ row }">
          <el-button link type="primary" @click="toggleContent(row)">
            {{ row.showContent ? '收起' : '查看' }}
          </el-button>
          <div v-if="row.showContent" class="content-preview">
            {{ row.announcementContent }}
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

    <!-- 创建/编辑公告对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '创建公告'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="formData.announcementTitle" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="formData.announcementContent"
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
import { announcementApi } from '../api/announcement'
import { errorHandler } from '../utils/errorHandler.js'

// 搜索相关
const searchKeyword = ref('')
const handleSearch = () => {
  currentPage.value = 1
  fetchAnnouncements()
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchAnnouncements()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchAnnouncements()
}

// 公告数据
const announcements = ref([])
const tableLoading = ref(false)

const fetchAnnouncements = async () => {
  tableLoading.value = true
  try {
    const requestData = {
      announcement_title: searchKeyword.value,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取公告列表请求数据：", requestData)
    const response = await announcementApi.getAnnouncement(requestData)
    if (response.code === 200) {
      announcements.value = response.data.data.map(item => ({
        ...item,
        showContent: false
      }))
      total.value = response.data.total_item
      console.log("获取公告列表响应数据：", response)
    } else {
      errorHandler.showError('获取公告列表失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取公告列表错误', error)
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
  announcementId: '',
  announcementTitle: '',
  announcementContent: ''
})

// 创建公告
const handleCreate = () => {
  isEdit.value = false
  formData.value = {
    announcementId: '',
    announcementTitle: '',
    announcementContent: ''
  }
  dialogVisible.value = true
}

// 编辑公告
const handleEdit = (announcement) => {
  isEdit.value = true
  formData.value = {
    announcementId: announcement.announcementId,
    announcementTitle: announcement.announcementTitle,
    announcementContent: announcement.announcementContent
  }
  dialogVisible.value = true
}

// 确认对话框
const confirmDialog = async () => {
  if (!formData.value.announcementTitle.trim()) {
    ElMessage.warning('请输入公告标题')
    return
  }
  if (!formData.value.announcementContent.trim()) {
    ElMessage.warning('请输入公告内容')
    return
  }

  loading.value = true
  try {
    const requestData = {
      announcementId: formData.value.announcementId,
      announcementTitle: formData.value.announcementTitle,
      announcementContent: formData.value.announcementContent
    }
    console.log("创建/修改公告请求数据：", requestData)
    const response = isEdit.value
      ? await announcementApi.updateAnnouncement(requestData)
      : await announcementApi.addAnnouncement(requestData)
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
      dialogVisible.value = false
      console.log("创建/修改公告响应数据：", response)
      fetchAnnouncements()
    } else if (response.code === 414) {
      errorHandler.showError('公告标题已存在', response)
    } else {
      errorHandler.showError(isEdit.value ? '修改公告失败' : '创建公告失败', response)
    }
  } catch (error) {
    errorHandler.showError(isEdit.value ? '修改公告错误' : '创建公告错误', error)
  } finally {
    loading.value = false
  }
}

// 删除公告
const handleDelete = (announcement) => {
  ElMessageBox.confirm(
    '确认删除公告 "' + announcement.announcementTitle + '" 吗？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const requestData = {
        announcement_id: announcement.announcementId
      }
      const response = await announcementApi.deleteAnnouncement(requestData)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        fetchAnnouncements()
      } else {
        errorHandler.showError('删除公告失败', response)
      }
    } catch (error) {
      errorHandler.showError('删除公告错误', error)
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 初始化
onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.announcement-management {
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