// src/views/OrderManagement.vue
<template>
  <div class="order-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <!-- <el-input
        v-model="searchForm.userAccount"
        placeholder="请输入用户账号"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><User /></el-icon>
        </template>
      </el-input>
      <el-input
        v-model="searchForm.productName"
        placeholder="请输入商品名称"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Goods /></el-icon>
        </template>
      </el-input> -->
      <el-input
        v-model="searchForm.orderId"
        placeholder="请输入订单号"
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Document /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- 订单表格 -->
    <el-table
      :data="orders"
      style="width: 100%"
      v-loading="tableLoading"
    >
      <el-table-column prop="orderId" label="订单号" min-width="200" />
      <el-table-column prop="productName" label="商品名称" min-width="150" />
      <el-table-column prop="name" label="收货人" min-width="100" />
      <el-table-column prop="phone" label="联系电话" min-width="120" />
      <el-table-column prop="address" label="收货地址" min-width="200" show-overflow-tooltip />
      <el-table-column label="订单金额" min-width="150">
        <template #default="{ row }">
          <div>单价：¥{{ row.singlePrice.toFixed(2) }}</div>
          <div>数量：{{ row.productAmount }}</div>
          <div>总价：¥{{ row.totalPrice.toFixed(2) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="支付状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '支付成功' : '支付失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="180">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, User, Goods, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { orderApi } from '../api/order'
import { errorHandler } from '../utils/errorHandler.js'

// 搜索相关
const searchForm = ref({
  userAccount: '',
  productName: '',
  orderId: ''
})

const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchOrders()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrders()
}

// 订单数据
const orders = ref([])
const tableLoading = ref(false)

const fetchOrders = async () => {
  tableLoading.value = true
  try {
    const requestData = {
      user_account: searchForm.value.userAccount,
      product_name: searchForm.value.productName,
      order_id: searchForm.value.orderId,
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取订单列表请求数据：", requestData)
    const response = await orderApi.getOrders(requestData)
    if (response.code === 200) {
      orders.value = response.data.data
      total.value = response.data.total_item
      console.log("获取订单列表响应数据：", response)
    } else {
      errorHandler.showError('获取订单列表失败', response)
    }
  } catch (error) {
    errorHandler.showError('获取订单列表错误', error)
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

// 初始化
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 200px;
  height: 50px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>