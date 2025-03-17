<template>
  <div class="news">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input
        v-model="searchForm.new_title"
        placeholder="搜索资讯标题"
        class="search-input"
        clearable
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 资讯列表 -->
    <div class="news-grid">
      <el-card 
        v-for="news in newsList" 
        :key="news.newId" 
        class="news-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <h3 class="news-title">{{ news.newTitle }}</h3>
            <span class="news-time">{{ formatDate(news.createdAt) }}</span>
          </div>
        </template>
        <div class="news-content">
          {{ news.newContent }}
        </div>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { newsApi } from '../api/news'
import { errorHandler } from '../utils/errorHandler'

// 数据定义
const newsList = ref([])
const currentPage = ref(1)
const pageSize = ref(4) // 每页4条数据（2行×2列）
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  new_title: '',
  page_num: 1,
  page_size: 4
})

// 方法定义
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleSearch = () => {
  currentPage.value = 1
  fetchNews()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchNews()
}

// API 调用方法
const fetchNews = async () => {
  try {
    const params = {
      new_title: searchForm.new_title,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取资讯请求数据:", params);
    const response = await newsApi.getNews(params)
    if (response.code === 200) {
      newsList.value = response.data.data
      total.value = response.data.total_item
      console.log("获取资讯响应数据:", response.data);
    } else {
      errorHandler.showError("获取资讯列表失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取资讯列表失败', error.message)
  }
}

// 初始化
fetchNews()
</script>

<style scoped>
.news {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-area {
  max-width: 500px;
  margin: 0 auto 30px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.news-card {
  height: 100%;
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  flex: 1;
  padding-right: 15px;
}

.news-time {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
}

.news-content {
  color: #666;
  line-height: 1.6;
  margin-top: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style> 