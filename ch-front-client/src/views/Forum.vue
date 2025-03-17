<template>
  <div class="forum">
    <!-- 左侧论坛帖子列表 -->
    <div class="forum-posts">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchForm.post_title"
          placeholder="搜索交流主题"
          class="search-input"
          clearable
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <!-- 帖子列表 -->
      <div class="posts-list">
        <el-card 
          v-for="post in posts" 
          :key="post.postId" 
          class="post-card"
          :class="{ 'active': currentPost?.postId === post.postId }"
          @click="selectPost(post)"
        >
          <div class="post-header">
            <h3 class="post-title">{{ post.postTitle }}</h3>
            <span class="post-time">{{ formatDate(post.createdAt) }}</span>
          </div>
          <div class="post-content">{{ post.postContent }}</div>
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

    <!-- 右侧评论区 -->
    <div class="forum-comments">
      <div v-if="currentPost" class="comments-container">
        <div class="comments-header">
          <h2>{{ currentPost.postTitle }}</h2>
          <el-button :icon="Refresh" circle @click="fetchComments" />
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
            <div class="comment-header">
              <el-icon><User /></el-icon>
              <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>

        <!-- 发送评论 -->
        <div class="comment-input">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="发表你的看法..."
          />
          <el-button type="primary" @click="sendComment" :disabled="!newComment.trim()">
            发送
          </el-button>
        </div>
      </div>
      <div v-else class="no-post-selected">
        <el-empty description="请选择一个帖子查看评论" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search, Refresh, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { forumApi } from '../api/forum'
import { errorHandler } from '../utils/errorHandler'

// 数据定义
const posts = ref([])
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const comments = ref([])
const currentPost = ref(null)
const newComment = ref('')

// 搜索表单
const searchForm = reactive({
  post_title: '',
  page_num: 1,
  page_size: 5
})

// 方法定义
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
  fetchPosts()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchPosts()
}

const selectPost = (post) => {
  currentPost.value = post
  fetchComments()
}

// API 调用方法
const fetchPosts = async () => {
  try {
    const params = {
      post_title: searchForm.post_title,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取帖子列表请求数据:", params);
    const response = await forumApi.getPost(params)
    if (response.code === 200) {
      posts.value = response.data.data
      total.value = response.data.total_item
      console.log("获取帖子列表响应数据:", response.data);
    } else {
      errorHandler.showError("获取帖子列表失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取帖子列表失败', error.message)
  }
}

const fetchComments = async () => {
  if (!currentPost.value) return
  
  try {
    const params = {
      post_id: currentPost.value.postId
    }
    console.log("获取评论请求数据:", params);
    const response = await forumApi.getComment(params)
    if (response.code === 200) {
      comments.value = response.data
      console.log("获取评论响应数据:", response);
    } else {
      errorHandler.showError("获取评论失败")
    }
  } catch (error) {
    errorHandler.showError('获取评论失败')
  }
}

const sendComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    const commentData = {
      postId: currentPost.value.postId,
      content: newComment.value.trim()
    }
    console.log("发送评论请求数据:", commentData);
    const response = await forumApi.sendComment(commentData)
    if (response.code === 200) {
      ElMessage.success('评论发送成功')
      newComment.value = ''
      fetchComments() // 刷新评论列表
    } else {
      errorHandler.showError("发送评论失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('发送评论失败', error.message)
  }
}

// 初始化
fetchPosts()
</script>

<style scoped>
.forum {
  display: flex;
  gap: 20px;
  height: calc(100vh - 180px);
  padding: 20px;
}

.forum-posts {
  width: 40%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.forum-comments {
  width: 60%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-area {
  padding: 0 0 10px 0;
}

.posts-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-card.active {
  border: 2px solid #409EFF;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-title {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-content {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.comments-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.comments-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.comment-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  color: #333;
  line-height: 1.6;
}

.comment-input {
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.no-post-selected {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}
</style> 