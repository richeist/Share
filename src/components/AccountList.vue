<template>
  <div class="account-container">
    <div class="header">
      <div class="header-content">
        <h1 class="title">账号共享平台</h1>
        <p class="subtitle">便捷 · 安全 · 高效</p>
        <div class="visit-stats">
          <div class="stat-item">
            <i class="fas fa-chart-line"></i>
            <span>总访问量: {{ stats.totalVisits }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-users"></i>
            <span>总访客数: {{ stats.totalVisitors }}</span>
          </div>
        </div>
      </div>
      <router-link to="/login" class="admin-btn">
        <i class="fas fa-user-shield"></i>
        管理员登录
      </router-link>
    </div>

    <div v-if="notifications.length" class="notifications">
      <div v-for="notification in notifications" :key="notification.id"
        :class="['notification-item', notification.type]">
        <div class="notification-title">
          <i :class="getNotificationIcon(notification.type)"></i>
          {{ notification.title }}
        </div>
        <div class="notification-content">{{ notification.content }}</div>
      </div>
    </div>
    <div class="search-box">


      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input v-model="searchQuery" placeholder="搜索平台..." class="search-input" />
      </div>
      <div class="platform-tags">
        <span v-for="platform in platforms" :key="platform"
          :class="['platform-tag', { active: selectedPlatform === platform }]" @click="selectPlatform(platform)">
          <i :class="getPlatformIcon(platform)"></i>
          {{ platform }}
        </span>
      </div>
    </div>

    <div class="account-grid">
      <div v-for="account in filteredAccounts" :key="account.id" class="account-card">
        <div class="account-header">
          <div class="platform-info">
            <i :class="getPlatformIcon(account.platform)"></i>
            <span>{{ account.platform }}</span>
          </div>
          <span class="account-id">#{{ account.id }}</span>
        </div>
        <div class="account-content">
          <div class="account-item">
            <span class="label">用户名:</span>
            <div class="value-container">
              <span class="value">{{ account.username }}</span>
              <button class="copy-btn" @click="copyToClipboard(account.username)"
                @touchstart="handleLongPress.start(account.username)" @touchend="handleLongPress.end()"
                :data-tooltip="'复制用户名'">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <div class="account-item">
            <span class="label">密码:</span>
            <div class="value-container">
              <span class="value">{{ showPassword[account.id] ? account.password : '********' }}</span>
              <button @click="togglePassword(account.id)" class="toggle-btn"
                :data-tooltip="showPassword[account.id] ? '隐藏密码' : '显示密码'">
                <i :class="showPassword[account.id] ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
              <button class="copy-btn" @click="copyToClipboard(account.password)"
                @touchstart="handleLongPress.start(account.password)" @touchend="handleLongPress.end()"
                :data-tooltip="'复制密码'">
                <i class="fas fa-copy"></i>
              </button>
            </div>
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
          <div class="account-item time-item" v-if="account.add_time">
            <i class="far fa-clock"></i>
            <span class="time-text">{{ formatDate(account.add_time) }}</span>
          </div>
          <div class="account-item tags-item" v-if="account.tags">
            <div class="tags-list">
              <span v-for="tag in account.tags.split(',')" :key="tag" class="tag">
                <i class="fas fa-tag"></i>
                {{ tag.trim() }}
              </span>
            </div>
          </div>
          <div class="account-item" v-if="account.code">
            <span class="label">验证码:</span>
            <div class="value-container">
              <span class="value">{{ account.code }}</span>
              <button class="copy-btn" @click="copyToClipboard(account.code)"
                @touchstart="handleLongPress.start(account.code)" @touchend="handleLongPress.end()"
                :data-tooltip="'复制验证码'">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          <div class="account-item" v-if="account.platform === 'Steam' && account.shared_secret">
            <span class="label">Steam令牌:</span>
            <div class="value-container">
              <span class="value steam-token">
                {{ steamTokens[account.id] || '加载中...' }}
                <span class="token-timer">{{ tokenRemainingTime }}s</span>
              </span>
              <button class="copy-btn"
                @click="copyToClipboard(steamTokens[account.id] || '')"
                @touchstart="handleLongPress.start(steamTokens[account.id] || '')"
                @touchend="handleLongPress.end()"
                :data-tooltip="'复制令牌'">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="footer-tips">
      <div class="tips-header">
        <i class="fas fa-info-circle"></i>
        <h3>温馨提示</h3>
      </div>
      <ul>
        <li>
          <i class="fas fa-exclamation-triangle"></i>
          请勿频繁切换账号，以免触发平台安全机制
        </li>
        <li>
          <i class="fas fa-sign-out-alt"></i>
          使用完毕后请及时退出登录
        </li>
        <li>
          <i class="fas fa-headset"></i>
          如遇账号异常，请联系管理员
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { getAccounts, getNotifications, getAccountsByPlatform, getPlatforms, getVisitStats } from '../api'
import { SteamGuard, getTokenRemainingTime } from '../utils/steamToken.js'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

const accounts = ref([])
const notifications = ref([])
const platforms = ref([])
const showPassword = reactive({})
const searchQuery = ref('')
const selectedPlatform = ref('')
const stats = ref({
  totalVisits: 0,
  totalVisitors: 0
})

// Steam令牌相关状态
const tokenRefreshTimer = ref(null)
const tokenRemainingTime = ref(30)
const steamTokens = ref({})

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const filteredAccounts = computed(() => {
  let result = accounts.value;
  if (searchQuery.value) {
    result = result.filter(account => 
      account.platform.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  return result;
})

const selectPlatform = async (platform) => {
  if (selectedPlatform.value === platform) {
    selectedPlatform.value = '';
    const response = await getAccounts();
    accounts.value = response.data;
  } else {
    selectedPlatform.value = platform;
    const response = await getAccountsByPlatform(platform);
    accounts.value = response.data;
  }
}

const copyToClipboard = async (text) => {
  if (!text) {
    ElMessage.warning('没有内容可复制')
    return
  }
 
  try {
    // 创建临时输入框
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    
    // 选择并复制
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length) // 兼容移动端
    const success = document.execCommand('copy')
    
    // 清理
    document.body.removeChild(textarea)
    
    if (success) {
      ElMessage({
        message: '复制成功',
        type: 'success',
        duration: 2000
      })
    } else {
      throw new Error('复制失败')
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      duration: 3000
    })
  }
}

// 添加长按复制支持
const handleLongPress = (() => {
  let timer = null
  let isLongPress = false

  const start = (text) => {
    isLongPress = false
    timer = setTimeout(() => {
      isLongPress = true
      copyToClipboard(text)
    }, 800) // 长按 800ms 触发
  }

  const end = () => {
    clearTimeout(timer)
    return isLongPress
  }

  return { start, end }
})()

const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 2000);
}

const togglePassword = (id) => {
  showPassword[id] = !showPassword[id];
  if (showPassword[id]) {
    setTimeout(() => {
      showPassword[id] = false;
    }, 3000);
  }
}

const getPlatformIcon = (platform) => {
  const iconMap = {
    'Netflix': 'fab fa-netflix',
    'Steam': 'fab fa-steam',
    'Spotify': 'fab fa-spotify',
    'Disney+': 'fab fa-disney-plus',
    'default': 'fas fa-tv'
  };
  return iconMap[platform] || iconMap.default;
}

const getNotificationIcon = (type) => {
  const icons = {
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle'
  };
  return icons[type] || icons.info;
}

// 获取Steam令牌
const getSteamToken = async (sharedSecret) => {
  try {
    console.log('正在生成令牌，shared_secret:', sharedSecret)
    const steamGuard = new SteamGuard(sharedSecret)
    const token = await steamGuard.generateCode() || '获取失败'
    console.log('生成的令牌:', token)
    if (token === '获取失败') {
      ElMessage({
        message: 'Steam令牌生成失败',
        type: 'warning',
        duration: 3000
      })
    }
    return token
  } catch (error) {
    console.error('获取Steam令牌失败:', error)
    return '获取失败'
  }
}

// 更新令牌
const updateTokens = async () => {
  console.log('开始更新所有令牌')
  for (const account of accounts.value) {
    if (account.platform === 'Steam' && account.shared_secret) {
      console.log(`更新账号 ${account.id} 的令牌, shared_secret:`, account.shared_secret)
      try {
        const steamGuard = new SteamGuard(account.shared_secret)
        const token = await steamGuard.generateCode() || '获取失败'
        console.log(`账号 ${account.id} 令牌更新成功:`, token)
        steamTokens.value[account.id] = token
      } catch (error) {
        console.error(`账号 ${account.id} 令牌更新失败:`, error)
        steamTokens.value[account.id] = '获取失败'
      }
    }
  }
  console.log('当前所有令牌:', steamTokens.value)
}

// 更新令牌剩余时间
const updateTokenTime = () => {
  tokenRemainingTime.value = getTokenRemainingTime()
}

// 启动令牌刷新定时器
const startTokenRefresh = () => {
  console.log('启动令牌刷新定时器') // 添加调试日志
  updateTokenTime()
  updateTokens() // 立即更新一次
  tokenRefreshTimer.value = setInterval(() => {
    updateTokenTime()
    if (tokenRemainingTime.value === 30) {
      updateTokens() // 每30秒更新一次
    }
  }, 1000)
}

onMounted(async () => {
  try {
    const [accountsRes, notificationsRes, platformsRes, statsRes] = await Promise.all([
      getAccounts(),
      getNotifications(),
      getPlatforms(),
      getVisitStats()
    ])
    accounts.value = accountsRes.data
    notifications.value = notificationsRes.data
    platforms.value = platformsRes.data
    stats.value = statsRes.data
    startTokenRefresh()
    ElMessage({
      message: '数据加载成功',
      type: 'success',
      duration: 2000
    })
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage({
      message: '加载数据失败: ' + error.message,
      type: 'error',
      duration: 3000
    })
  }
})

onUnmounted(() => {
  if (tokenRefreshTimer.value) {
    clearInterval(tokenRefreshTimer.value)
  }
})
</script>

<style scoped>
.account-container {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* 头部样式 */
.header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 80px 20px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 150%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% -50%, rgba(255,255,255,0.15) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 3.5rem;
  margin-bottom: 15px;
  font-weight: 700;
  text-shadow: 0 2px 15px rgba(0,0,0,0.2);
  letter-spacing: 1px;
  background: linear-gradient(to right, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleFadeIn 1s ease-out;
}

.subtitle {
  font-size: 1.4rem;
  opacity: 0.95;
  margin-bottom: 40px;
  font-weight: 400;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 600px;
  line-height: 1.4;
  animation: subtitleSlideUp 1s ease-out 0.3s both;
}

/* 访问统计样式 */
.visit-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
  animation: statsSlideUp 1s ease-out 0.6s both;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 30px;
  border-radius: 30px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.stat-item i {
  font-size: 1.4rem;
  opacity: 0.9;
}

/* 管理员按钮样式 */
.admin-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.admin-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* 搜索区域样式 */
.search-box {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.search-wrapper {
  background: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--box-shadow);
  position: relative;
}

.search-wrapper input {
  width: 100%;
  padding: 12px 20px 12px 48px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-wrapper input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.search-wrapper .search-icon {
  position: absolute;
  left: 35px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 18px;
}

/* 平台标签样式 */
.platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.platform-tag {
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--box-shadow);
}

.platform-tag i {
  font-size: 16px;
  color: var(--primary-color);
}

.platform-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.platform-tag.active {
  background: var(--primary-color);
  color: white;
}

.platform-tag.active i {
  color: white;
}

/* 账号网格样式 */
.account-grid {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.account-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
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
  flex-direction: column;
  gap: 8px;
}

.account-item .label {
  color: var(--text-secondary);
  font-size: 14px;
}

.value-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.copy-btn, .toggle-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  position: relative;
}

.copy-btn:hover, .toggle-btn:hover {
  color: var(--primary-color);
}

/* 状态样式 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-normal {
  background: rgba(76, 175, 80, 0.1);
}

.status-warning {
  background: rgba(255, 152, 0, 0.1);
}

.status-error {
  background: rgba(244, 67, 54, 0.1);
}

/* 标签样式 */
.tags-list {
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag i {
  font-size: 12px;
}

/* 时间项样式 */
.time-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

.time-item i {
  font-size: 14px;
}

/* 提示区域样式 */
.footer-tips {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 20px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: var(--primary-color);
}

.tips-header h3 {
  font-size: 18px;
  margin: 0;
}

.footer-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-tips li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: var(--text-secondary);
}

.footer-tips li i {
  color: var(--primary-color);
}

/* 复制提示动画 */
.copy-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  z-index: 1000;
  animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  20% { opacity: 1; transform: translate(-50%, 0); }
  80% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 60px 20px;
  }

  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
    padding: 0 20px;
  }

  .visit-stats {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
  }

  .stat-item {
    width: 100%;
    max-width: 300px;
    justify-content: center;
    padding: 12px 25px;
  }

  .admin-btn {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 20px;
    display: inline-flex;
  }

  .platform-tags {
    justify-content: center;
  }

  .account-grid {
    grid-template-columns: 1fr;
  }
}

/* 通知区域样式 */
.notifications {
  max-width: 1200px;
  margin: -30px auto 20px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.notification-item {
  background: white;
  border-radius: var(--border-radius);
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: var(--box-shadow);
  border-left: 4px solid transparent;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item.info {
  border-left-color: var(--info-color);
}

.notification-item.warning {
  border-left-color: var(--warning-color);
}

.notification-item.danger {
  border-left-color: var(--danger-color);
}

.notification-item.success {
  border-left-color: var(--success-color);
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.notification-title i {
  font-size: 18px;
}

.notification-item.info .notification-title {
  color: var(--info-color);
}

.notification-item.warning .notification-title {
  color: var(--warning-color);
}

.notification-item.danger .notification-title {
  color: var(--danger-color);
}

.notification-item.success .notification-title {
  color: var(--success-color);
}

.notification-content {
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 14px;
  padding-left: 28px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 在响应式设计部分添加 */
@media (max-width: 768px) {
  .notifications {
    margin-top: -20px;
    padding: 0 15px;
  }

  .notification-item {
    padding: 12px 15px;
  }

  .notification-title {
    font-size: 15px;
  }

  .notification-content {
    font-size: 13px;
    padding-left: 24px;
  }
}

/* 添加动画关键帧 */
@keyframes titleFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes subtitleSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes statsSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加深色模式支持 */
@media (prefers-color-scheme: dark) {
  .title {
    background: linear-gradient(to right, #ffffff, #bbdefb);
    -webkit-background-clip: text;
  }
}

.steam-token {
  font-family: monospace;
  font-size: 1.2em;
  letter-spacing: 2px;
  background: rgba(var(--primary-rgb), 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.steam-token-tips {
  color: var(--text-secondary);
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .copy-btn {
    min-width: 36px;
    min-height: 36px;
    padding: 8px;
  }
  
  .value-container {
    gap: 8px;
  }
  
  /* 禁用长按选择文本 */
  .value-container {
    user-select: none;
    -webkit-user-select: none;
  }
  
  /* 添加触摸反馈 */
  .copy-btn:active {
    transform: scale(0.95);
    opacity: 0.8;
  }
}
</style> 