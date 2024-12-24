<template>
  <div class="account-manage">
    <div class="page-header">
      <h2>账号管理</h2>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        添加账号
      </button>
    </div>

    <!-- 账号列表 -->
    <div class="account-list">
      <div v-for="account in accounts" :key="account.id" class="account-card">
        <div class="account-header">
          <div class="platform-info">
            <i :class="getPlatformIcon(account.platform)"></i>
            <span>{{ account.platform }}</span>
          </div>
          <div class="account-actions">
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
        </div>
      </div>
    </div>

    <!-- 添加/编辑账号弹窗 -->
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
            <input 
              v-if="formData.platform === 'other'"
              v-model="formData.customPlatform"
              class="input"
              placeholder="输入平台名称"
            />
          </div>
          <div class="form-group">
            <label>标签</label>
            <input v-model="formData.tags" class="input" placeholder="多个标签用逗号分隔" />
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
import { ref, onMounted } from 'vue'
import { getAccounts, addAccount, updateAccount, deleteAccount as deleteAccountApi, getPlatforms } from '../../api'

const accounts = ref([])
const platforms = ref([])
const showAddModal = ref(false)
const editingAccount = ref(null)
const formData = ref({
  username: '',
  password: '',
  platform: '',
  customPlatform: '',
  tags: ''
})

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

// 编辑账号
const editAccount = (account) => {
  editingAccount.value = account
  formData.value = { ...account }
}

// 删除账号
const deleteAccount = async (id) => {
  if (confirm('确定要删除这个账号吗？')) {
    try {
      await deleteAccountApi(id)
      await fetchAccounts()
    } catch (error) {
      console.error('删除账号失败:', error)
    }
  }
}

// 保存账号
const saveAccount = async () => {
  try {
    const accountData = {
      ...formData.value,
      platform: formData.value.platform === 'other' ? formData.value.customPlatform : formData.value.platform
    }

    if (editingAccount.value) {
      await updateAccount(editingAccount.value.id, accountData)
    } else {
      await addAccount(accountData)
    }
    
    await fetchAccounts()
    closeModal()
  } catch (error) {
    console.error('保存账号失败:', error)
  }
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  editingAccount.value = null
  formData.value = {
    username: '',
    password: '',
    platform: '',
    customPlatform: '',
    tags: ''
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
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

onMounted(() => {
  fetchAccounts()
  fetchPlatforms()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.account-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.account-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.account-header {
  background: var(--primary-color);
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.account-content {
  padding: 20px;
}

.account-item {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: var(--bg-light);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-secondary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
}

.account-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .account-list {
    grid-template-columns: 1fr;
  }
}
</style> 