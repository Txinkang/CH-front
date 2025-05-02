<template>
  <div class="home">
    <el-carousel height="100vh" :interval="3000" arrow="always" indicator-position="none">
      <el-carousel-item v-for="banner in banners" :key="banner.bannerId">
        <img :src="getBannerImageUrl(banner.bannerImage)" :alt="banner.bannerName" class="carousel-image">
      </el-carousel-item>
    </el-carousel>
  </div>

  <!-- 资讯列表 -->
  <div class="news">
    <div class="news-title">
      <h2>资讯列表</h2>
    </div>
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
  </div>

  <!-- 项目列表 -->
  <div class="projects">
    <div class="projects-title">
      <h2>非遗文化列表</h2>
    </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bannerApi } from '../api/banner'
import ConstData from '../constant/ConstData'
import { errorHandler } from '../utils/errorHandler'
import { newsApi } from '../api/news'
import { cultureApi } from '../api/culture'

// 数据定义
const banners = ref([])
const projects = ref([])


const getBannerImageUrl = (imageName) => {
  return `${ConstData.bannerPicturePath}${imageName}`
}

const fetchBanners = async () => {
  try {
    const response = await bannerApi.getBanner()
    console.log("response:", response);
    banners.value = response.data
  } catch (error) {
    console.error('Error fetching banners:', error)
  }
}

// 资讯列表
const newsList = ref([])
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
const fetchNews = async () => {
  try {
    const params = {
      new_title: '',
      page_num: 1,
      page_size: 4
    }
    console.log("获取资讯请求数据:", params);
    const response = await newsApi.getNews(params)
    if (response.code === 200) {
      newsList.value = response.data.data
      console.log("获取资讯响应数据:", response.data);
    } else {
      errorHandler.showError("获取资讯列表失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取资讯列表失败', error.message)
  }
}

// 非遗文化列表
const getProjectImages = (imageString) => {
  return imageString ? imageString.split('|').filter(img => img) : []
}

const getImageUrl = (image) => {
  return `${ConstData.heritagePicturePath}${image}`
}

const fetchProjects = async () => {
  try {
    const params = {
      project_title: '',
      page_num: 1,
      page_size: 4
    }
    console.log("获取非遗文化请求参数:", params);
    const response = await cultureApi.getProject(params)
    console.log("获取非遗文化响应数据:", response);
    if (response.code === 200) {
      projects.value = response.data.data
    } else {
      errorHandler.showError("获取项目列表失败", response)
    }
  } catch (error) {
    errorHandler.showError('获取项目列表失败', error)
  }
}
onMounted(() => {
  fetchBanners()
  fetchNews()
  fetchProjects()
})
</script>

<style scoped>
.home {
  padding: 0;
  height: calc(100vh - 120px); /* 减去header和nav的高度 */
  width: 100%;
  margin-top: -2rem; /* 抵消main-content的padding */
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.el-carousel) {
  height: 100%;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.3);
  font-size: 20px;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(0, 0, 0, 0.5);
}


/* 资讯列表 */
.news {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.news-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
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
</style> 