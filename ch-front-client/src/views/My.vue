<template>
  <div class="my">
    <el-tabs v-model="activeTab">
      <!-- 个人信息标签页 -->
      <el-tab-pane label="个人信息" name="info">
        <div class="info-container">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <h3>个人信息</h3>
                <div class="header-actions">
                  <el-button :icon="Refresh" circle @click="fetchUserInfo" />
                  <el-button type="primary" @click="showEditDialog">修改信息</el-button>
                  <el-button type="success" @click="showRechargeDialog">充值</el-button>
                  <el-button type="info" @click="showProjectsDialog">查看个人非遗项目</el-button>
                </div>
              </div>
            </template>
            
            <div class="info-content">
              <div class="info-item">
                <span class="label">账号：</span>
                <span>{{ userInfo.userAccount }}</span>
              </div>
              <div class="info-item">
                <span class="label">密码：</span>
                <span>{{ userInfo.userPassword }}</span>
              </div>
              <div class="info-item">
                <span class="label">余额：</span>
                <span class="balance">¥{{ userInfo.userBalance }}</span>
              </div>
              <div class="info-item">
                <span class="label">注册时间：</span>
                <span>{{ formatDate(userInfo.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 修改信息弹窗 -->
        <el-dialog v-model="editDialog.visible" title="修改信息" width="30%">
          <el-form
            ref="editFormRef"
            :model="editForm"
            :rules="editRules"
            label-width="80px"
            status-icon
          >
            <el-form-item label="账号" prop="userAccount">
              <el-input v-model="editForm.userAccount" />
            </el-form-item>
            <el-form-item label="密码" prop="userPassword">
              <el-input v-model="editForm.userPassword" type="password" show-password />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="editDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="confirmEdit">确认</el-button>
          </template>
        </el-dialog>

        <!-- 充值弹窗 -->
        <el-dialog v-model="rechargeDialog.visible" title="充值" width="30%">
          <el-form
            ref="rechargeFormRef"
            :model="rechargeForm"
            :rules="rechargeRules"
            label-width="80px"
          >
            <el-form-item label="充值金额" prop="amount">
              <el-input-number
                v-model="rechargeForm.amount"
                :precision="2"
                :step="10"
                :min="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="rechargeDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="confirmRecharge">确认</el-button>
          </template>
        </el-dialog>

        <!-- 个人非遗项目弹窗 -->
        <el-dialog v-model="projectsDialog.visible" title="个人非遗项目" width="80%">
          <el-table :data="projects" style="width: 100%">
            <el-table-column prop="projectTitle" label="项目名称" />
            <el-table-column prop="projectContent" label="项目内容" show-overflow-tooltip />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag
                  :type="getStatusType(row.status)"
                  style="cursor: pointer"
                  @click="row.status === 3 && showFailReason(row.projectId)"
                >
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" :formatter="formatTableDate" />
            <el-table-column label="操作" width="280">
              <template #default="{ row }">
                <el-button type="primary" @click="showEditProject(row)">修改</el-button>
                <el-button type="danger" @click="handleDeleteProject(row.projectId)">删除</el-button>
                <el-button 
                  v-if="row.status === 3"
                  type="warning" 
                  @click="handleReapply(row.projectId)"
                >
                  重新申请
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>

        <!-- 修改项目弹窗 -->
        <el-dialog v-model="editProjectDialog.visible" title="修改项目" width="60%">
          <el-form
            ref="editProjectFormRef"
            :model="editProjectForm"
            :rules="editProjectRules"
            label-width="120px"
            status-icon
          >
            <el-form-item label="项目名称" prop="project_title">
              <el-input v-model="editProjectForm.project_title" />
            </el-form-item>

            <el-form-item label="项目内容" prop="project_content">
              <el-input
                v-model="editProjectForm.project_content"
                type="textarea"
                :rows="4"
              />
            </el-form-item>

            <el-form-item label="项目图片" prop="project_image">
              <el-upload
                v-model:file-list="imageFileList"
                :auto-upload="false"
                list-type="picture-card"
                :on-change="handleImageChange"
                :on-remove="handleImageRemove"
                multiple
                accept="image/*"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="项目材料" prop="project_material">
              <el-upload
                v-model:file-list="materialFileList"
                :auto-upload="false"
                :limit="1"
                :on-change="handleMaterialChange"
                :on-remove="handleMaterialRemove"
                accept=".doc,.docx,.pdf,.zip,.rar"
              >
                <el-button type="primary">选择材料</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 doc、pdf、zip、rar 格式，只能选择一个文件
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="editProjectDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="confirmEditProject">确认</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 订单管理标签页 -->
      <el-tab-pane label="订单管理" name="orders">
        <el-table :data="orders" style="width: 100%">
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="productAmount" label="数量" width="80" />
          <el-table-column label="单价" width="100">
            <template #default="{ row }">
              ¥{{ row.singlePrice }}
            </template>
          </el-table-column>
          <el-table-column label="总价" width="100">
            <template #default="{ row }">
              ¥{{ row.totalPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="收货人" width="100" />
          <el-table-column prop="phone" label="联系电话" width="120" />
          <el-table-column prop="address" label="收货地址" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="创建时间" :formatter="formatTableDate" width="160" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="showCommentDialog(row)">评价</el-button>
            </template>
          </el-table-column>
        </el-table>

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
        <el-dialog v-model="commentDialog.visible" title="商品评价" width="40%">
          <el-form
            ref="commentFormRef"
            :model="commentForm"
            :rules="commentRules"
            label-width="80px"
          >
            <el-form-item label="评分" prop="productScore">
              <el-rate
                v-model="commentForm.productScore"
                :max="5"
                :texts="['极差', '失望', '一般', '满意', '惊喜']"
                show-text
              />
            </el-form-item>
            <el-form-item label="评语" prop="productComment">
              <el-input
                v-model="commentForm.productComment"
                type="textarea"
                :rows="4"
                placeholder="请输入您的评价"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="commentDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="submitComment">提交评价</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { myApi } from '../api/my'
import { errorHandler } from '../utils/errorHandler'

// 数据定义
const activeTab = ref('info')
const userInfo = ref({})
const projects = ref([])

// 修改信息
const editDialog = reactive({
  visible: false
})

const editForm = reactive({
  userAccount: '',
  userPassword: ''
})

const editRules = {
  userAccount: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const editFormRef = ref(null)

// 充值
const rechargeDialog = reactive({
  visible: false
})

const rechargeForm = reactive({
  amount: 0
})

const rechargeRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ]
}

const rechargeFormRef = ref(null)

// 项目弹窗
const projectsDialog = reactive({
  visible: false
})

// 修改项目
const editProjectDialog = reactive({
  visible: false,
  currentProject: null
})

const editProjectForm = reactive({
  project_title: '',
  project_content: '',
  project_image: '',
  project_material: ''
})

const editProjectRules = {
  project_title: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  project_content: [
    { required: true, message: '请输入项目内容', trigger: 'blur' },
    { min: 10, max: 2000, message: '长度在 10 到 2000 个字符', trigger: 'blur' }
  ]
}

const editProjectFormRef = ref(null)
const imageFileList = ref([])
const materialFileList = ref([])

// 订单管理
const orders = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 评价弹窗
const commentDialog = reactive({
  visible: false,
  currentOrder: null
})

const commentForm = reactive({
  productId: '',
  productScore: 0,
  productComment: ''
})

const commentRules = {
  productScore: [
    { required: true, message: '请选择评分', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '评分范围为1-5分', trigger: 'change' }
  ],
  productComment: [
    { required: true, message: '请输入评语', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ]
}

const commentFormRef = ref(null)

// 方法定义
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTableDate = (row, column, cellValue) => {
  return formatDate(cellValue)
}

const getStatusType = (status) => {
  const types = {
    1: 'info',    // 审核中
    2: 'success', // 审核成功
    3: 'danger'   // 审核失败
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    1: '审核中',
    2: '审核成功',
    3: '审核失败'
  }
  return texts[status] || '未知状态'
}

// API 调用方法
const fetchUserInfo = async () => {
  try {
    const response = await myApi.getUserInfo()
    if (response.code === 200) {
      userInfo.value = response.data
      console.log(userInfo.value)
    } else {
      errorHandler.showError("获取用户信息失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取用户信息失败', error.message)
  }
}

const showEditDialog = () => {
  editForm.user_account = userInfo.value.userAccount
  editForm.user_password = ''
  editDialog.visible = true
}

const confirmEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    console.log("修改个人信息请求参数", editForm)
    const response = await myApi.updateUserInfo(editForm)
    if (response.code === 200) {
      ElMessage.success('修改成功')
      editDialog.visible = false
      console.log("修改个人信息响应参数", response)
      fetchUserInfo()
    } else {
      errorHandler.showError("修改失败", response.message)
    }
  } catch (error) {
    if (error.message) {
      errorHandler.showError('修改失败', error.message)
    }
  }
}

const showRechargeDialog = () => {
  rechargeForm.amount = 0
  rechargeDialog.visible = true
}

const confirmRecharge = async () => {
  if (!rechargeFormRef.value) return

  try {
    await rechargeFormRef.value.validate()
    const response = await myApi.recharge({ amount: rechargeForm.amount })
    console.log("充值请求参数", rechargeForm)
    if (response.code === 200) {
      ElMessage.success('充值成功')
      rechargeDialog.visible = false
      fetchUserInfo()
      console.log("充值响应参数", response)
    } else {
      errorHandler.showError("充值失败", response.message)
    }
  } catch (error) {
    if (error.message) {
      errorHandler.showError('充值失败', error.message)
    }
  }
}

const showProjectsDialog = async () => {
  try {
    const response = await myApi.getSelfProject()
    console.log("获取个人非遗项目请求参数", response)
    if (response.code === 200) {
      projects.value = response.data
      projectsDialog.visible = true
      console.log("获取个人非遗项目响应参数", response)
    } else {
      errorHandler.showError("获取项目列表失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取项目列表失败', error.message)
  }
}

const showFailReason = async (projectId) => {
  try {
    const response = await myApi.getFailReason({ project_id: projectId })
    console.log("获取失败原因请求参数", response)
    if (response.code === 200) {
      ElMessageBox.alert(response.data)
      console.log("获取失败原因响应参数", response)
    } else {
      errorHandler.showError("获取失败原因失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取失败原因失败', error.message)
  }
}

const handleReapply = async (projectId) => {
  try {
    await ElMessageBox.confirm('确定要重新申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await myApi.retryApplication({ project_id: projectId })
    console.log("重新申请请求参数", response)
    if (response.code === 200) {
      ElMessage.success('重新申请成功')
      showProjectsDialog()
      console.log("重新申请响应参数", response)
    } else {
      errorHandler.showError("重新申请失败", response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      errorHandler.showError('重新申请失败', error.message)
    }
  }
}

const handleDeleteProject = async (projectId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await myApi.deleteProject({ project_id: projectId })
    console.log("删除项目请求参数", response)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      showProjectsDialog()
      console.log("删除项目响应参数", response)
    } else {
      errorHandler.showError("删除失败", response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      errorHandler.showError('删除失败', error.message)
    }
  }
}

// 文件处理
const handleImageChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('图片大小不能超过 50MB！')
    return false
  }
  return true
}

const handleImageRemove = (file) => {
  const index = imageFileList.value.indexOf(file)
  if (index !== -1) {
    imageFileList.value.splice(index, 1)
  }
}

const handleMaterialChange = (file) => {
  const allowedTypes = ['.doc', '.docx', '.pdf', '.zip', '.rar']
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedTypes.includes(extension)) {
    ElMessage.error('只能上传 doc、pdf、zip、rar 格式的文件！')
    return false
  }
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB！')
    return false
  }
  return true
}

const handleMaterialRemove = () => {
  materialFileList.value = []
}

const showEditProject = (project) => {
  editProjectDialog.currentProject = project
  editProjectForm.project_title = project.projectTitle
  editProjectForm.project_content = project.projectContent
  editProjectDialog.visible = true
}

const confirmEditProject = async () => {
  if (!editProjectFormRef.value) return

  try {
    await editProjectFormRef.value.validate()
    
    if (imageFileList.value.length === 0) {
      ElMessage.error('请选择项目图片')
      return
    }
    if (materialFileList.value.length === 0) {
      ElMessage.error('请选择项目材料')
      return
    }

    const formData = new FormData()
    formData.append('project_id', editProjectDialog.currentProject.projectId)
    formData.append('project_title', editProjectForm.project_title)
    formData.append('project_content', editProjectForm.project_content)
    
    imageFileList.value.forEach((file) => {
      formData.append('project_image', file.raw)
    })
    
    formData.append('project_material', materialFileList.value[0].raw)

    const response = await myApi.updateProject(formData)
    if (response.code === 200) {
      ElMessage.success('修改成功')
      editProjectDialog.visible = false
      showProjectsDialog()
    } else {
      errorHandler.showError("修改失败", response.message)
    }
  } catch (error) {
    if (error.message) {
      errorHandler.showError('修改失败', error.message)
    }
  }
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    const params = {
      page_num: currentPage.value,
      page_size: pageSize.value
    }
    console.log("获取订单列表请求参数:", params)
    const response = await myApi.getOrders(params)
    if (response.code === 200) {
      orders.value = response.data.data
      total.value = response.data.total_item
      console.log("获取订单列表响应数据:", response)
    } else {
      errorHandler.showError("获取订单列表失败", response.message)
    }
  } catch (error) {
    errorHandler.showError('获取订单列表失败', error.message)
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchOrders()
}

const showCommentDialog = (order) => {
  commentDialog.currentOrder = order
  commentForm.productId = order.productId
  commentForm.productScore = 0
  commentForm.productComment = ''
  commentDialog.visible = true
}

const submitComment = async () => {
  if (!commentFormRef.value) return

  try {
    await commentFormRef.value.validate()
    console.log("提交评价请求参数:", commentForm)
    const response = await myApi.evaluateProduct(commentForm)
    if (response.code === 200) {
      ElMessage.success('评价成功')
      commentDialog.visible = false
      console.log("提交评价响应数据:", response)
    } else {
      errorHandler.showError("评价失败", response.message)
    }
  } catch (error) {
    if (error.message) {
      errorHandler.showError('评价失败', error.message)
    }
  }
}

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'orders') {
    fetchOrders()
  }
})

// 初始化
fetchUserInfo()
</script>

<style scoped>
.my {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.info-container {
  max-width: 800px;
  margin: 0 auto;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.info-content {
  padding: 20px 0;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.info-item .label {
  width: 100px;
  color: #666;
}

.info-item .balance {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

:deep(.el-upload--picture-card) {
  width: 150px;
  height: 150px;
  line-height: 150px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 