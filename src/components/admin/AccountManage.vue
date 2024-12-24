<template>
  <div class="account-manage">
    <!-- 1. 顶部操作栏 -->
    <div class="page-header">
      <h2>账号管理</h2>
      <div class="header-actions">
        <button @click="refreshAccounts" class="btn btn-refresh" :class="{ 'is-refreshing': isRefreshing }">
          <i class="fas fa-sync-alt"></i>
          刷新
        </button>
        <button @click="showAddModal = true" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          添加账号
        </button>
        <button @click="$refs.fileInput.click()" class="btn btn-success">
          <i class="fas fa-file-import"></i>
          导入账号
        </button>
        <button @click="showBatchActions = !showBatchActions" class="btn btn-secondary">
          <i class="fas fa-tasks"></i>
          批量操作
        </button>
        <input ref="fileInput" type="file" accept=".txt,.xlsx,.xls" style="display: none" @change="handleFileImport" />
      </div>
    </div>

    <!-- 2. 搜索和筛选区域 -->
    <div class="filter-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model="searchQuery" placeholder="搜索账号..." @input="handleSearch" />
      </div>

      <div class="filter-options">
        <div class="filter-group">
          <label>平台:</label>
          <select v-model="selectedPlatform" @change="handleFilter">
            <option value="">全部</option>
            <option v-for="platform in platforms" :key="platform" :value="platform">
              {{ platform }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>状态:</label>
          <select v-model="selectedStatus" @change="handleFilter">
            <option value="">全部</option>
            <option value="正常">正常</option>
            <option value="待检测">待检测</option>
            <option value="异常">异常</option>
          </select>
        </div>

        <div class="filter-group">
          <label>标签:</label>
          <select v-model="selectedTag" @change="handleFilter">
            <option value="">全部</option>
            <option v-for="tag in allTags" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 3. 统计区域 -->
    <div class="stats-section">
      <div class="stat-card">
        <i class="fas fa-list-alt"></i>
        <div class="stat-info">
          <span class="stat-value">{{ filteredAccounts.length }}</span>
          <span class="stat-label">显示账号</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-check-circle"></i>
        <div class="stat-info">
          <span class="stat-value">{{ normalAccountsCount }}</span>
          <span class="stat-label">正常账号</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-question-circle"></i>
        <div class="stat-info">
          <span class="stat-value">{{ pendingAccountsCount }}</span>
          <span class="stat-label">待检测账号</span>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-exclamation-circle"></i>
        <div class="stat-info">
          <span class="stat-value">{{ abnormalAccountsCount }}</span>
          <span class="stat-label">异常账号</span>
        </div>
      </div>
    </div>

    <!-- 4. 批量操作区域 -->
    <div class="batch-actions" v-if="showBatchActions">
      <div class="selected-info">
        已选择 {{ selectedAccounts.length }} 个账号
      </div>
      <div class="action-buttons">
        <button @click="batchUpdateStatus('正常')" class="btn btn-success">
          <i class="fas fa-check-circle"></i>
          标记正常
        </button>
        <button @click="batchUpdateStatus('待检测')" class="btn btn-warning">
          <i class="fas fa-question-circle"></i>
          标记待检测
        </button>
        <button @click="batchUpdateStatus('异常')" class="btn btn-danger">
          <i class="fas fa-exclamation-circle"></i>
          标记异常
        </button>
        <button @click="batchDelete" class="btn btn-danger">
          <i class="fas fa-trash"></i>
          批量删除
        </button>
      </div>
    </div>

    <!-- 5. 账号列表 -->
    <div class="account-list">
      <div v-for="account in filteredAccounts" :key="account.id" class="account-card"
        :class="{ selected: selectedAccounts.includes(account.id) }">
        <div class="account-header">
          <div class="platform-info">
            <i :class="getPlatformIcon(account.platform)"></i>
            <span>{{ account.platform }}</span>
            <span class="account-id">#{{ account.id }}</span>
          </div>
          <div class="account-actions">
            <label v-if="showBatchActions" class="checkbox-wrapper">
              <input type="checkbox" :checked="selectedAccounts.includes(account.id)"
                @change="toggleSelection(account.id)" />
              <span class="checkmark"></span>
            </label>
            <button @click="editAccount(account)" class="btn btn-info">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteAccount(account.id)" class="btn btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="account-content">
          <div class="account-item">
            <span class="label">用户名:</span>
            <span class="value">{{ account.username }}</span>
          </div>
          <div class="account-item">
            <span class="label">密码:</span>
            <span class="value">{{ account.password }}</span>
          </div>
          <div class="account-item">
            <span class="label">状态:</span>
            <span :class="['value', 'status-badge', {
              'status-normal': account.status === '正常',
              'status-warning': account.status === '待检测',
              'status-error': !account.status || account.status === '异常'
            }]" :style="{
              color: account.status === '正常' ? '#4CAF50' :
                account.status === '异常' ? '#f44336' :
                  account.status === '待检测' ? '#ff9800' : '#f44336'
            }">
              <i :class="{
                'fas fa-check-circle text-green-500': account.status === '正常',
                'fas fa-question-circle text-yellow-500': account.status === '待检测',
                'fas fa-exclamation-circle text-red-500': !account.status || account.status === '异常'
              }"></i>
              {{ account.status || '异常' }}
            </span>
          </div>
          <div class="account-item" v-if="account.tags">
            <span class="label">标签:</span>
            <div class="tags">
              <span v-for="tag in account.tags.split(',')" :key="tag" class="tag">
                {{ tag.trim() }}
              </span>
            </div>
          </div>
          <div class="account-item">
            <span class="label">添加时间:</span>
            <span class="value">{{ formatDate(account.add_time) }}</span>
          </div>
          <div class="account-item">
            <span class="label">验证码:</span>
            <span class="value">{{ account.code || '无' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. 添加/编辑账号弹窗 -->
    <div class="modal" v-if="showAddModal || editingAccount">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingAccount ? '编辑账号' : '添加账号' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="formData.username" class="input" placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="formData.password" class="input" placeholder="请输入密码" />
          </div>
          <div class="form-group">
            <label>平台</label>
            <select v-model="formData.platform" class="input">
              <option value="">选择平台</option>
              <option v-for="platform in platforms" :key="platform" :value="platform">
                {{ platform }}
              </option>
              <option value="other">其他</option>
            </select>
            <input v-if="formData.platform === 'other'" v-model="formData.customPlatform" class="input"
              placeholder="输入平台名称" />
          </div>
          <div class="form-group">
            <label>标签</label>
            <input v-model="formData.tags" class="input" placeholder="多个标签用逗号分隔" />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="formData.status" class="input" @change="handleStatusChange">
              <option value="正常">正常</option>
              <option value="待检测">待检测</option>
              <option value="异常">异常</option>
            </select>
            <span class="status-indicator" :class="formData.status">
              <i :class="{
                'fas fa-check-circle': formData.status === '正常',
                'fas fa-question-circle': formData.status === '待检测',
                'fas fa-exclamation-circle': formData.status === '异常'
              }"></i>
              {{ formData.status }}
            </span>
          </div>
          <div class="form-group">
            <label>验证码</label>
            <input v-model="formData.code" class="input" placeholder="请输入短信验证码" />
          </div>
          <!-- Steam令牌相关字段 -->
          <div class="form-group" v-if="formData.platform === 'Steam'">
            <label>Steam令牌配置</label>
            <div class="steam-token-import">
              <button @click="$refs.tokenFile.click()" class="btn btn-secondary">
                <i class="fas fa-file-import"></i>
                导入令牌文件
              </button>
              <input
                ref="tokenFile"
                type="file"
                accept=".txt,.json"
                style="display: none"
                @change="importSteamToken"
              />
            </div>
            <input v-model="formData.shared_secret" class="input" placeholder="Steam令牌shared_secret" />
            <input v-model="formData.identity_secret" class="input mt-2" placeholder="Steam身份验证secret" />
            <input v-model="formData.steamid" class="input mt-2" placeholder="Steam ID" />
            <div class="steam-token-tips mt-2">
              <i class="fas fa-info-circle"></i>
              <span>从Steam手机令牌文件中获取，文件位置: /data/data/com.valvesoftware.android.steam.community/files/Steamguard-{steamid}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">取消</button>
          <button @click="saveAccount" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getAccounts, addAccount, updateAccount, deleteAccount as deleteAccountApi, getPlatforms, addAccounts } from '../../api'
import { read, utils } from 'xlsx'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

// 状态变量
const accounts = ref([])
const platforms = ref([])
const allTags = ref([])
const showAddModal = ref(false)
const editingAccount = ref(null)
const showBatchActions = ref(false)
const selectedAccounts = ref([])
const searchQuery = ref('')
const selectedPlatform = ref('')
const selectedStatus = ref('')
const selectedTag = ref('')
const isRefreshing = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  platform: '',
  customPlatform: '',
  status: '正常',
  tags: '',
  code: '',
  shared_secret: '',
  identity_secret: '',
  steamid: ''
})

// 编辑账号
const editAccount = (account) => {
  console.log('编辑账号:', account)
  editingAccount.value = account
  formData.username = account.username
  formData.password = account.password
  formData.platform = account.platform
  formData.status = account.status || '正常'
  formData.tags = account.tags || ''
  formData.code = account.code || ''
  formData.shared_secret = account.shared_secret || ''
  formData.identity_secret = account.identity_secret || ''
  formData.steamid = account.steamid || ''
  showAddModal.value = true
}

// 删除账号
const deleteAccount = async (id) => {
  if (!confirm('确定要删除这个账号吗？')) return
  try {
    await deleteAccountApi(id)
    await fetchAccounts()
  } catch (error) {
    console.error('删除账号失败:', error)
    alert('删除失败: ' + error.message)
  }
}

// 关闭模态框
const closeModal = () => {
  showAddModal.value = false
  editingAccount.value = null
  Object.assign(formData, {
    username: '',
    password: '',
    platform: '',
    customPlatform: '',
    status: '正常',
    tags: '',
    code: '',
    shared_secret: '',
    identity_secret: '',
    steamid: ''
  })
}

// 保存账号
const saveAccount = async () => {
  try {
    const accountData = {
      username: formData.username,
      password: formData.password,
      platform: formData.platform === 'other' ? formData.customPlatform : formData.platform,
      status: formData.status,
      tags: formData.tags,
      code: formData.code,
      shared_secret: formData.shared_secret,
      identity_secret: formData.identity_secret,
      steamid: formData.steamid
    }

    if (editingAccount.value) {
      await updateAccount(editingAccount.value.id, accountData)
      ElMessage.success('账号更新成功')
    } else {
      await addAccount(accountData)
      ElMessage.success('账号添加成功')
    }

    await fetchAccounts()
    closeModal()
  } catch (error) {
    console.error('保存账号失败:', error)
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 获取账号列表
const fetchAccounts = async () => {
  try {
    const response = await getAccounts()
    accounts.value = response.data
  } catch (error) {
    console.error('获取账号列表失败:', error)
  }
}

// 获取平台列表
const fetchPlatforms = async () => {
  try {
    const response = await getPlatforms()
    platforms.value = response.data
  } catch (error) {
    console.error('获取平台列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  // 可以添加防抖处理
}

// 处理筛选
const handleFilter = () => {
  // 重置选中状态
  selectedAccounts.value = []
}

// 处理状态变更
const handleStatusChange = () => {
  // 可以添加额外的状态变更逻辑
}

// 切换账号选择
const toggleSelection = (id) => {
  const index = selectedAccounts.value.indexOf(id)
  if (index === -1) {
    selectedAccounts.value.push(id)
  } else {
    selectedAccounts.value.splice(index, 1)
  }
}

// 批量更新状态
const batchUpdateStatus = async (status) => {
  if (!selectedAccounts.value.length) return
  try {
    await updateAccountsStatus(selectedAccounts.value, status)
    await fetchAccounts()
    selectedAccounts.value = []
  } catch (error) {
    console.error('批量更新状态失败:', error)
    alert('更新失败: ' + error.message)
  }
}

// 批量删除
const batchDelete = async () => {
  if (!selectedAccounts.value.length || 
      !confirm(`确定要删除选中的 ${selectedAccounts.value.length} 个账号吗？`)) {
    return
  }
  try {
    await deleteAccounts(selectedAccounts.value)
    await fetchAccounts()
    selectedAccounts.value = []
  } catch (error) {
    console.error('批量删除失败:', error)
    alert('删除失败: ' + error.message)
  }
}

// 获取平台图标
const getPlatformIcon = (platform) => {
  const iconMap = {
    'Netflix': 'fab fa-netflix',
    'Steam': 'fab fa-steam',
    'Spotify': 'fab fa-spotify',
    'Disney+': 'fab fa-disney-plus',
    'default': 'fas fa-tv'
  }
  return iconMap[platform] || iconMap.default
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleString()
}

// 计算属性
const filteredAccounts = computed(() => {
  let result = accounts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(account => 
      account.username.toLowerCase().includes(query) ||
      account.platform.toLowerCase().includes(query) ||
      (account.tags && account.tags.toLowerCase().includes(query))
    )
  }

  if (selectedPlatform.value) {
    result = result.filter(account => account.platform === selectedPlatform.value)
  }

  if (selectedStatus.value) {
    result = result.filter(account => account.status === selectedStatus.value)
  }

  if (selectedTag.value) {
    result = result.filter(account => 
      account.tags && account.tags.split(',').map(t => t.trim()).includes(selectedTag.value)
    )
  }

  return result
})

const normalAccountsCount = computed(() => 
  accounts.value.filter(a => a.status === '正常').length
)

const pendingAccountsCount = computed(() => 
  accounts.value.filter(a => a.status === '待检测').length
)

const abnormalAccountsCount = computed(() => 
  accounts.value.filter(a => !a.status || a.status === '异常').length
)

// 添加刷新方法
const refreshAccounts = async () => {
  if (isRefreshing.value) return
  
  try {
    isRefreshing.value = true
    const response = await getAccounts()
    accounts.value = response.data
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    ElMessage.error('刷新失败: ' + error.message)
  } finally {
    isRefreshing.value = false
  }
}

// 添加导入Steam令牌文件的方法
const importSteamToken = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const secrets = extractSteamSecrets(e.target.result)
      if (secrets) {
        formData.shared_secret = secrets.shared_secret
        formData.identity_secret = secrets.identity_secret
        formData.steamid = secrets.steamid
        ElMessage.success('Steam令牌导入成功')
      } else {
        throw new Error('无效的Steam令牌文件')
      }
    } catch (error) {
      console.error('导入Steam令牌失败:', error)
      ElMessage.error('导入失败: ' + error.message)
    }
  }
  reader.readAsText(file)
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchAccounts(),
    fetchPlatforms()
  ])
})
</script>

<style scoped>
/* 页面整体布局 */
.account-manage {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 顶部操作栏样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.page-header h2 {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn i {
  font-size: 16px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-success {
  background: #4CAF50;
  color: white;
}

.btn-success:hover {
  background: #43A047;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f5f5f5;
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* 搜索和筛选区域 */
.filter-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 12px 20px 12px 48px;
  border: 2px solid #eee;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 18px;
}

.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-weight: 500;
}

.filter-group select {
  width: 100%;
  padding: 10px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.filter-group select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

/* 统计卡片样式 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card i {
  font-size: 28px;
  color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.1);
  padding: 12px;
  border-radius: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 批量操作区域 */
.batch-actions {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  font-weight: 500;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 账号卡片样式 */
.account-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.account-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.account-card.selected {
  border: 2px solid var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
}

.account-header {
  background: var(--primary-color);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-info i {
  font-size: 20px;
}

.account-id {
  opacity: 0.8;
  font-size: 14px;
}

.account-content {
  padding: 20px;
}

.account-item {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.account-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.account-item .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.account-item .value {
  color: var(--text-primary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

/* 状态样式 */
.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.status-normal {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.status-warning {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.status-error {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .account-manage {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-options {
    grid-template-columns: 1fr;
  }

  .batch-actions {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }

  .account-list {
    grid-template-columns: 1fr;
  }
}

/* 验证码输入框样式 */
.form-group input[type="text"].code-input {
  letter-spacing: 2px;
  font-family: monospace;
  text-align: center;
}

/* 验证码显示样式 */
.account-item .code-value {
  font-family: monospace;
  letter-spacing: 1px;
  background: rgba(var(--primary-rgb), 0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, var(--primary-color), var(--primary-dark));
  border-radius: 20px 20px 0 0;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 15px;
}

.form-group .input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: var(--bg-light);
}

.form-group .input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
  background: white;
}

.form-group select.input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.status-select-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.status-option {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-option.selected {
  border-color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.1);
}

.status-option i {
  font-size: 16px;
}

.status-option.normal {
  color: var(--success-color);
}

.status-option.warning {
  color: var(--warning-color);
}

.status-option.danger {
  color: var(--danger-color);
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--bg-light);
  border-radius: 0 0 20px 20px;
}

.modal-footer .btn {
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  min-width: 120px;
}

.modal-footer .btn-primary {
  background: linear-gradient(to right, var(--primary-color), var(--primary-dark));
}

.modal-footer .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(40px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-header h3 {
    font-size: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 20px;
    flex-direction: column;
  }
  
  .modal-footer .btn {
    width: 100%;
    min-width: unset;
  }
  
  .status-select-group {
    flex-direction: column;
  }
}

/* 在现有样式基础上添加 */
.btn-refresh {
  background: var(--bg-light);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.btn-refresh i {
  transition: transform 0.3s ease;
}

.btn-refresh:hover i {
  transform: rotate(180deg);
}

.btn-refresh.is-refreshing i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 