<template>
  <div class="cart">
    <div class="cart-header">
      <h1>购物车</h1>
      <el-button :icon="Refresh" circle @click="fetchCartItems" />
    </div>

    <div class="cart-content">
      <template v-if="cartItems.length > 0">
        <el-card v-for="item in cartItems" :key="item.cartId" class="cart-item">
          <div class="cart-item-content">
            <!-- 商品图片轮播 -->
            <div class="item-image">
              <el-carousel height="200px" indicator-position="inside" :interval="4000">
                <el-carousel-item v-for="(image, index) in getProductImages(item.productImage)" :key="index">
                  <img :src="getImageUrl(image)" :alt="item.productName" class="product-image">
                </el-carousel-item>
              </el-carousel>
            </div>

            <!-- 商品信息 -->
            <div class="item-info">
              <span class="product-name">商品名称：{{ item.productName }}</span>
              <span class="product-desc">商品描述：{{ item.productDescription }}</span>
              <span class="price">单价：¥{{ item.productPrice }}</span>
              <span class="amount">数量：{{ item.productAmount }}</span>
              <span class="total-price">
                总价：<span class="price">¥{{ (item.productPrice * item.productAmount).toFixed(2) }}</span>
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="item-actions">
              <el-button type="danger" @click="handleDelete(item.cartId)">删除</el-button>
              <el-button type="primary" @click="showBuyDialog(item)">购买</el-button>
            </div>
          </div>
        </el-card>
      </template>
      <el-empty v-else description="购物车是空的" />
    </div>

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
        <el-form-item label="单价">
          <span class="total-price">¥{{ buyForm.singlePrice }}</span>
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
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cartApi } from '../api/cart'
import { productApi } from '../api/product'
import { errorHandler } from '../utils/errorHandler'

// 数据定义
const cartItems = ref([])

// 购买弹窗控制
const buyDialog = reactive({
  visible: false,
  currentItem: null
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

// 方法定义
const getProductImages = (imageString) => {
  return imageString ? imageString.split('|').filter(img => img) : []
}

const getImageUrl = (image) => {
  return `http://localhost:8080/images/productPictures/${image}`
}

const calculateTotal = () => {
  buyForm.totalPrice = buyForm.singlePrice * buyForm.productAmount
}

const fetchCartItems = async () => {
  try {
    const response = await cartApi.getCart()
    console.log("获取购物车列表响应数据:", response);
    if (response.code === 200) {
      cartItems.value = response.data
    } else {
      errorHandler.showError("获取购物车列表失败", response)
    }
  } catch (error) {
    errorHandler.showError('获取购物车列表失败', error)
  }
}

const handleDelete = async (cartId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await cartApi.deleteCart({ cart_id: cartId })
    if (response.code === 200) {
      ElMessage.success('删除成功')
      fetchCartItems() // 刷新购物车列表
    } else {
      errorHandler.showError("删除失败", response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      errorHandler.showError('删除失败', error.message)
    }
  }
}

const showBuyDialog = (item) => {
  buyDialog.currentItem = item
  buyForm.productId = item.productId
  buyForm.productAmount = item.productAmount
  buyForm.singlePrice = item.productPrice
  buyForm.totalPrice = item.productPrice * item.productAmount
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
      // 购买成功后从购物车中删除
      await cartApi.deleteCart({ cart_id: buyDialog.currentItem.cartId })
      fetchCartItems() // 刷新购物车列表
    } else if (response.code === 415) {
      errorHandler.showError("余额不足", response)
    } else {
      errorHandler.showError("购买失败", response)
    }
  } catch (error) {
    if (error.message) {
      errorHandler.showError('购买失败', error)
    }
  }
}

// 初始化
fetchCartItems()
</script>

<style scoped>
.cart {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.cart-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  margin-bottom: 20px;
}

.cart-item-content {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.item-image {
  width: 300px;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.amount {
  color: #666;
}

.total-price {
  color: #333;
  font-size: 16px;
}

.item-actions {
  width: 120px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
  }

  .item-actions {
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
    padding: 10px 0;
  }
}
</style> 