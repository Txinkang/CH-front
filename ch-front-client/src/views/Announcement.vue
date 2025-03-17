<template>
  <div class="announcement">
    <h1 class="page-title">通知公告</h1>
    
    <div class="announcement-list">
      <el-card v-for="item in announcements" :key="item.announcementId" class="announcement-card">
        <div class="card-header">
          <h2 class="announcement-title">{{ item.announcementTitle }}</h2>
          <span class="announcement-time">{{ formatDate(item.createdAt) }}</span>
        </div>
        <div class="divider"></div>
        <el-collapse>
          <el-collapse-item>
            <template #title>
              <span class="content-preview">{{ item.announcementContent.substring(0, 50) }}...</span>
            </template>
            <div class="announcement-content">{{ item.announcementContent }}</div>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
        layout="total, prev, pager, next"
      />
      <el-button type="primary" :icon="Refresh" circle @click="fetchAnnouncements" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { announcementApi } from '../api/announcement'
import { errorHandler } from '../utils/errorHandler'
const announcements = ref([])
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchAnnouncements = async () => {
  try {
    const requestData = {
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    const response = await announcementApi.getAnnouncement(requestData)
    if (response.code === 200) {
      announcements.value = response.data.data
      total.value = response.data.total_item
    } else {
        errorHandler.showError("获取公告数据失败", response.message)
    }
  } catch (error) {
    errorHandler.showError("获取公告数据失败", error.message)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchAnnouncements()
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.announcement {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 32px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.announcement-list {
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.announcement-card {
  width: 100%;
  transition: all 0.3s ease;
}

.announcement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.announcement-title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.announcement-time {
  color: #999;
  font-size: 14px;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 10px 0;
}

.content-preview {
  color: #666;
  font-size: 14px;
}

.announcement-content {
  padding: 10px 0;
  line-height: 1.6;
  color: #333;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

:deep(.el-collapse-item__header) {
  cursor: pointer;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}
</style> 