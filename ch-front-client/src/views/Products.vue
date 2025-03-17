<template>
  <div class="products">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input
        v-model="searchForm.product_name"
        placeholder="请输入商品名称"
        class="search-input"
        clearable
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 商品列表 -->
    <div class="products-grid">
      <el-card v-for="product in products" :key="product.productId" class="product-card">
        <!-- 商品图片轮播 -->
        <el-carousel height="200px" indicator-position="inside" :interval="4000">
          <el-carousel-item v-for="(image, index) in getProductImages(product.productImage)" :key="index">
            <img :src="getImageUrl(image)" :alt="product.productName" class="product-image">
          </el-carousel-item>
        </el-carousel>

        <!-- 商品信息 -->
        <div class="product-info">
          <h3 class="product-name">{{ product.productName }}</h3>
          <div class="price-section">
            <span class="price">¥{{ product.productPrice }}</span>
            <el-button type="primary" size="small" @click="showDescription(product.productId)">
              查看简介
            </el-button>
          </div>
          
          <div class="action-buttons">
            <el-button type="primary" @click="showComments(product.productId)">查看评价</el-button>
            <el-button type="success" @click="addToCart(product)">加入购物车</el-button>
            <el-button type="danger" @click="showBuyDialog(product)">立即购买</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
        layout="total, prev, pager, next"
      />
    </div>

    <!-- 评价弹窗 -->
    <el-dialog v-model="commentDialog.visible" title="商品评价" width="50%">
      <div v-if="comments && comments.length > 0" class="comments-list">
        <div v-for="comment in comments" :key="comment.productCommentId" class="comment-item">
          <div class="comment-header">
            <el-rate v-model="comment.productScore" disabled />
            <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="comment-content">{{ comment.productComment }}</p>
        </div>
      </div>
      <div v-else class="no-comments">暂无评价</div>
    </el-dialog>

    <!-- 商品简介弹窗 -->
    <el-dialog v-model="descriptionDialog.visible" title="商品简介" width="30%">
      <p>{{ descriptionDialog.content }}</p>
    </el-dialog>

    <!-- 加入购物车弹窗 -->
    <el-dialog v-model="cartDialog.visible" title="加入购物车" width="30%">
      <div class="cart-dialog-content">
        <div class="product-info-row">
          <span class="label">商品单价：</span>
          <span class="price">¥{{ cartDialog.price }}</span>
        </div>
        <div class="product-info-row">
          <span class="label">购买数量：</span>
          <el-input-number 
            v-model="cartDialog.amount" 
            :min="1" 
            @change="calculateCartTotal"
          />
        </div>
        <div class="product-info-row">
          <span class="label">总价：</span>
          <span class="total-price">¥{{ cartDialog.total }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="cartDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddToCart">确认</el-button>
      </template>
    </el-dialog>

    <!-- 购买弹窗 -->
    <el-dialog v-model="buyDialog.visible" title="确认购买" width="40%">
      <el-form
        ref="buyFormRef"
        :model="buyForm"
        :rules="buyFormRules"
        label-width="80px"
        status-icon
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="buyForm.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="buyForm.phone" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="buyForm.address" type="textarea" />
        </el-form-item>
        <el-form-item label="数量" prop="productAmount">
          <el-input-number v-model="buyForm.productAmount" :min="1" @change="calculateTotal" />
        </el-form-item>
        <el-form-item label="总价">
          <span class="total-price">¥{{ buyForm.totalPrice }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="buyDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmBuy">确认购买</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { productApi } from '../api/product'
import { errorHandler } from '../utils/errorHandler'

// 数据定义
const products = ref([])
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)
const comments = ref([])

// 搜索表单
const searchForm = reactive({
  product_name: '',
  page_num: 1,
  page_size: 8
})

// 弹窗控制
const commentDialog = reactive({
  visible: false
})

const descriptionDialog = reactive({
  visible: false,
  content: ''
})

const buyDialog = reactive({
  visible: false,
  currentProduct: null
})

// 购买表单
const buyForm = reactive({
  name: '',
  phone: '',
  address: '',
  productId: '',
  productAmount: 1,
  singlePrice: 0,
  totalPrice: 0
})

// 添加表单校验规则
const buyFormRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  productAmount: [
    { required: true, message: '请选择购买数量', trigger: 'change' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'change' }
  ]
}

const buyFormRef = ref(null)

// 购物车弹窗控制
const cartDialog = reactive({
  visible: false,
  productId: '',
  price: 0,
  amount: 1,
  total: 0
})

// 方法定义
const getProductImages = (imageString) => {
  return imageString ? imageString.split('|').filter(img => img) : []
}

const getImageUrl = (image) => {
  return `http://localhost:8080/images/productPictures/${image}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

const calculateTotal = () => {
  buyForm.totalPrice = buyForm.singlePrice * buyForm.productAmount
}

const calculateCartTotal = () => {
  cartDialog.total = cartDialog.price * cartDialog.amount
}

// API 调用方法
const fetchProducts = async () => {
  try {
    const params = {
      product_name: searchForm.product_name,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取商品请求数据:", params);
    const response = await productApi.getProduct(params)
    if (response.code === 200) {
      products.value = response.data.data
      total.value = response.data.total_item
      console.log("获取商品响应数据:", response.data);
    } else {
      errorHandler.showError("获取商品列表失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取商品列表失败', error.message)
  }
}

const showComments = async (productId) => {
  try {
    const requestData = {
      product_id: productId,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取商品评价请求数据:", requestData);
    const response = await productApi.getProductComment(requestData)
    if (response.code === 200) {
      comments.value = response.data || []
      commentDialog.visible = true
      console.log("获取商品评价响应数据:", response.data);
    } else {
      errorHandler.showError("获取商品评价失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取评价失败', error.message)
  }
}

const showDescription = async (productId) => {
  try {
    const requestData = {
      product_id: productId
    }
    console.log("获取商品简介请求数据:", requestData);
    const response = await productApi.getDescription(requestData)
    if (response.code === 200) {
      descriptionDialog.content = response.data
      descriptionDialog.visible = true
      console.log("获取商品简介响应数据:", response.data);
    } else {
      errorHandler.showError("获取商品简介失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取商品简介失败', error.message)
  }
}

const addToCart = (product) => {
  cartDialog.productId = product.productId
  cartDialog.price = product.productPrice
  cartDialog.amount = 1
  cartDialog.total = product.productPrice
  cartDialog.visible = true
}

const confirmAddToCart = async () => {
  try {
    const cartItem = {
      productId: cartDialog.productId,
      productAmount: cartDialog.amount
    }
    console.log("加入购物车请求数据:", cartItem);
    const response = await productApi.addCart(cartItem)
    if (response.code === 200) {
      ElMessage.success('成功加入购物车')
      cartDialog.visible = false
      console.log("加入购物车响应数据:", response.data);
    } else {
      errorHandler.showError("加入购物车失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('加入购物车失败', error.message)
  }
}

const showBuyDialog = (product) => {
  buyDialog.currentProduct = product
  buyForm.productId = product.productId
  buyForm.singlePrice = product.productPrice
  buyForm.totalPrice = product.productPrice
  buyDialog.visible = true
}

const confirmBuy = async () => {
  if (!buyFormRef.value) return
  
  try {
    await buyFormRef.value.validate()
    const response = await productApi.buyProduct(buyForm)
    if (response.code === 200) {
      ElMessage.success('购买成功')
      buyDialog.visible = false
    } else {
      errorHandler.showError("购买失败", response.message)
    }
  } catch (error) {
    if (error.message) {
      errorHandler.showError('购买失败', error.message)
    }
  }
}

// 初始化
fetchProducts()
</script>

<style scoped>
.products {
  padding: 20px;
}

.search-area {
  max-width: 500px;
  margin: 0 auto 30px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px 0;
}

.product-name {
  margin: 0 0 10px;
  font-size: 18px;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.comments-list {
  max-height: 400px;
  overflow-y: auto;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-time {
  color: #999;
  font-size: 14px;
}

.comment-content {
  margin: 0;
  color: #666;
}

.no-comments {
  text-align: center;
  color: #999;
  padding: 20px;
}

.total-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.cart-dialog-content {
  padding: 20px;
}

.product-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.product-info-row .label {
  color: #606266;
  font-size: 14px;
}

.product-info-row .price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.product-info-row .total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}
</style> 