<template>
  <div class="admin-container">
    <div class="header">
      <div class="header-content">
        <h1 class="title">账号管理后台</h1>
        <p class="subtitle">管理 · 维护 · 监控</p>
      </div>
      <button @click="logout" class="btn btn-danger logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        退出登录
      </button>
    </div>
    
    <div class="add-account-form card">
      <h3 class="section-title">
        <i class="fas fa-plus-circle"></i>
        添加新账号
      </h3>
      <div class="form-group">
        <input v-model="newAccount.username" placeholder="用户名" class="input" />
        <input v-model="newAccount.password" placeholder="密码" class="input" />
        <select v-model="newAccount.platform" class="input">
          <option value="">选择平台</option>
          <option v-for="platform in platforms" :key="platform" :value="platform">
            {{ platform }}
          </option>
          <option value="other">其他</option>
        </select>
        <input 
          v-if="newAccount.platform === 'other'" 
          v-model="newAccount.customPlatform" 
          placeholder="输入平台名称" 
          class="input" 
        />
      </div>
      <div class="tags-section">
        <div class="tags-header">
          <label class="checkbox-label">
            <input type="checkbox" v-model="enableTags">
            添加标签
          </label>
        </div>
        <div v-if="enableTags" class="tags-content">
          <div class="existing-tags">
            <span 
              v-for="tag in availableTags" 
              :key="tag"
              :class="['tag', { active: selectedTags.includes(tag) }]"
              @click="toggleTag(tag)"
            >
              <i class="fas fa-tag"></i>
              {{ tag }}
            </span>
          </div>
          <div class="custom-tag">
            <input 
              v-model="newTag" 
              placeholder="新标签" 
              class="input"
              @keyup.enter="addNewTag"
            />
            <button @click="addNewTag" class="btn btn-primary">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="form-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="addTime">
          <span>添加当前时间</span>
        </label>
      </div>
      <button @click="handleAddAccount" class="btn btn-success add-btn">
        <i class="fas fa-plus"></i>
        添加账号
      </button>
    </div>

    <div class="account-grid">
      <div v-for="account in accounts" :key="account.id" class="account-card">
        <div class="account-header">
          <div class="platform-info">
            <i :class="getPlatformIcon(account.platform)"></i>
            <span>{{ account.platform }}</span>
          </div>
          <span class="account-id">#{{ account.id }}</span>
        </div>
        <div class="account-content">
          <template v-if="!editingId || editingId !== account.id">
            <div class="account-item">
              <span class="label">用户名:</span>
              <span class="value">{{ account.username }}</span>
            </div>
            <div class="account-item">
              <span class="label">密码:</span>
              <div class="password-container">
                <span class="value">{{ showPassword[account.id] ? account.password : '********' }}</span>
                <button @click="togglePassword(account.id)" class="btn btn-info toggle-btn">
                  <i :class="showPassword[account.id] ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            <div class="account-item time-item" v-if="account.add_time">
              <i class="far fa-clock"></i>
              <span class="time-text">{{ formatDate(account.add_time) }}</span>
            </div>
            <div class="button-group">
              <button @click="startEdit(account)" class="btn btn-primary">
                <i class="fas fa-edit"></i> 编辑
              </button>
              <button @click="handleDelete(account.id)" class="btn btn-danger">
                <i class="fas fa-trash"></i> 删除
              </button>
            </div>
          </template>

          <template v-else>
            <div class="account-item">
              <span class="label">用户名:</span>
              <input 
                v-model="editingAccount.username" 
                class="input"
                placeholder="用户名"
              />
            </div>
            <div class="account-item">
              <span class="label">密码:</span>
              <input 
                v-model="editingAccount.password" 
                class="input"
                placeholder="密码"
              />
            </div>
            <div class="account-item">
              <span class="label">平台:</span>
              <input 
                v-model="editingAccount.platform" 
                class="input"
                placeholder="平台"
              />
            </div>
            <div class="button-group">
              <button @click="saveEdit" class="btn btn-success">
                <i class="fas fa-check"></i> 保存
              </button>
              <button @click="cancelEdit" class="btn btn-info">
                <i class="fas fa-times"></i> 取消
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <i class="fas fa-spinner fa-spin"></i>
      加载中...
    </div>

    <div class="notifications-section card">
      <h3 class="section-title">
        <i class="fas fa-bell"></i>
        通知管理
      </h3>
      <div class="form-group">
        <div class="notification-input-group">
          <input 
            v-model="newNotification.title" 
            placeholder="通知标题" 
            class="input"
          />
          <textarea 
            v-model="newNotification.content" 
            placeholder="通知内容" 
            class="input notification-content" 
            rows="3"
          ></textarea>
          <select v-model="newNotification.type" class="input notification-type">
            <option value="info">普通信息</option>
            <option value="warning">警告</option>
            <option value="danger">重要</option>
          </select>
        </div>
        <button @click="handleAddNotification" class="btn btn-primary notification-btn">
          <i class="fas fa-plus"></i>
          发布通知
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAccounts, addAccount, updateAccount, deleteAccount as deleteAccountApi, getNotifications, addNotification as addNotificationApi, getPlatforms, getTags } from '../api'

const router = useRouter()
const showPassword = reactive({})
const addTime = ref(false)
const accounts = ref([])
const loading = ref(false)
const platforms = ref([])
const availableTags = ref([])
const enableTags = ref(false)
const selectedTags = ref([])
const newTag = ref('')

onMounted(() => {
  if (!localStorage.getItem('isAdmin')) {
    router.push('/login')
  } else {
    fetchAccounts()
  }
})

const newAccount = ref({
  username: '',
  password: '',
  platform: ''
})

const newNotification = ref({
  title: '',
  content: '',
  type: 'info'
})

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  // 检查是否是有效的日期
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const fetchAccounts = async () => {
  loading.value = true
  try {
    const response = await getAccounts()
    accounts.value = response.data
  } catch (error) {
    console.error('获取账号列表失败:', error)
    alert('获取账号列表失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
}

const handleAddAccount = async () => {
  if (!newAccount.value.username || !newAccount.value.password || !newAccount.value.platform) {
    alert('请填写完整信息！')
    return
  }
  
  try {
    const accountData = {
      ...newAccount.value,
      platform: newAccount.value.platform === 'other' ? newAccount.value.customPlatform : newAccount.value.platform,
      tags: enableTags.value ? selectedTags.value.join(',') : null,
      add_time: addTime.value ? new Date().toISOString() : null
    }
    
    await addAccount(accountData)
    await fetchAccounts()
    
    newAccount.value = {
      username: '',
      password: '',
      platform: '',
      customPlatform: ''
    }
    enableTags.value = false
    selectedTags.value = []
    addTime.value = false
    
    alert('添加成功！')
  } catch (error) {
    console.error('添加账号失败:', error)
    alert('添加账号失败，请重试')
  }
}

const togglePassword = (id) => {
  showPassword[id] = !showPassword[id]
  if (showPassword[id]) {
    setTimeout(() => {
      showPassword[id] = false
    }, 3000)
  }
}

const handleDelete = async (id) => {
  if (confirm('确定要删除这个账号吗？')) {
    try {
      await deleteAccountApi(id)
      await fetchAccounts()
      alert('删除成功！')
    } catch (error) {
      console.error('删除账号失败:', error)
      alert('删除失败，请重试')
    }
  }
}

const logout = () => {
  localStorage.removeItem('isAdmin')
  router.push('/')
}

const editingId = ref(null)
const editingAccount = ref({})

const startEdit = (account) => {
  editingId.value = account.id
  editingAccount.value = { ...account }
}

const saveEdit = async () => {
  if (!editingAccount.value.username || !editingAccount.value.password || !editingAccount.value.platform) {
    alert('请填写完整信息！')
    return
  }

  try {
    const updatedData = {
      username: editingAccount.value.username,
      password: editingAccount.value.password,
      platform: editingAccount.value.platform
    }
    
    await updateAccount(editingAccount.value.id, updatedData)
    await fetchAccounts()
    editingId.value = null
    editingAccount.value = {}
    alert('更新成功！')
  } catch (error) {
    console.error('更新账号失败:', error)
    alert('更新失败，请重试')
  }
}

const cancelEdit = () => {
  editingId.value = null
  editingAccount.value = {}
}

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

const handleAddNotification = async () => {
  if (!newNotification.value.title || !newNotification.value.content) {
    alert('请填写完整信息！')
    return
  }

  try {
    await addNotificationApi(newNotification.value)
    alert('通知发布成功！')
    newNotification.value = { title: '', content: '', type: 'info' }
  } catch (error) {
    console.error('发布通知失败:', error)
    alert('发布失败，请重试')
  }
}

onMounted(async () => {
  try {
    const [platformsRes, tagsRes] = await Promise.all([
      getPlatforms(),
      getTags()
    ])
    platforms.value = platformsRes.data
    availableTags.value = tagsRes.data
  } catch (error) {
    console.error('获取数据失败:', error)
  }
})

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const addNewTag = () => {
  if (newTag.value && !availableTags.value.includes(newTag.value)) {
    availableTags.value.push(newTag.value)
    selectedTags.value.push(newTag.value)
    newTag.value = ''
  }
}
</script>

<style scoped>
.admin-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: 30px;
  border-radius: var(--border-radius);
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.subtitle {
  margin: 10px 0 0;
  opacity: 0.9;
  font-size: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  margin: 0 0 20px 0;
}

.section-title i {
  color: var(--success-color);
}

.form-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.form-options {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.button-group .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .form-group {
    flex-direction: column;
  }

  .button-group {
    flex-direction: column;
  }
}

.account-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.account-card:hover {
  transform: translateY(-5px);
}

.account-header {
  background: var(--primary-color);
  color: white;
  padding: 15px;
  font-weight: bold;
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
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.password-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-item {
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}

.label {
  color: var(--text-secondary);
  font-weight: 500;
}

.value {
  color: var(--text-primary);
  font-weight: bold;
  font-family: monospace;
  letter-spacing: 1px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
  color: var(--primary-color);
  z-index: 1000;
}

.loading-overlay i {
  font-size: 32px;
}

.tags-section {
  margin-top: 15px;
  border-top: 1px solid var(--border-color);
  padding-top: 15px;
}

.tags-content {
  margin-top: 10px;
}

.existing-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  background: var(--bg-light);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.tag.active {
  background: var(--primary-color);
  color: white;
}

.custom-tag {
  display: flex;
  gap: 8px;
}

.custom-tag .input {
  flex: 1;
}

.custom-tag .btn {
  padding: 8px;
}

/* 通知管理样式 */
.notifications-section {
  margin-top: 30px;
  animation: slideUp 0.5s ease;
}

.notification-input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.notification-content {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.notification-type {
  background-color: var(--bg-secondary);
  cursor: pointer;
}

.notification-type option {
  padding: 8px;
}

.notification-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background: var(--primary-color);
  transition: all 0.3s ease;
}

.notification-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .notifications-section {
    margin-top: 20px;
  }

  .notification-input-group {
    gap: 10px;
  }

  .notification-content {
    min-height: 80px;
  }
}

/* 通知类型颜色 */
.notification-type option[value="info"] {
  color: var(--primary-color);
}

.notification-type option[value="warning"] {
  color: var(--warning-color);
}

.notification-type option[value="danger"] {
  color: var(--danger-color);
}

/* 添加动画效果 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 确保所有输入框样式统一 */
.input {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  outline: none;
}

/* 卡片样式增强 */
.card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 标题样式 */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 1.2em;
}

.section-title i {
  color: var(--primary-color);
}
</style> 