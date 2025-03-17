<template>
  <div class="home">
    <el-carousel height="100vh" :interval="3000" arrow="always" indicator-position="none">
      <el-carousel-item v-for="banner in banners" :key="banner.bannerId">
        <img :src="getBannerImageUrl(banner.bannerImage)" :alt="banner.bannerName" class="carousel-image">
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bannerApi } from '../api/banner'

const banners = ref([])

const getBannerImageUrl = (imageName) => {
  return `http://localhost:8080/images/bannerPictures/${imageName}`
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

onMounted(() => {
  fetchBanners()
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
</style> 