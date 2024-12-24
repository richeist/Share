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
              <button @click="copyToClipboard(account.username)" class="copy-btn" :data-tooltip="'复制用户名'">
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
              <button @click="copyToClipboard(account.password)" class="copy-btn" :data-tooltip="'复制密码'">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { getAccounts, getNotifications, getAccountsByPlatform, getPlatforms, getVisitStats } from '../api'

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
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showNotification('复制成功');
  } catch (err) {
    alert('复制失败，请手动复制');
  }
}

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
    console.log('获取到的统计数据:', statsRes.data)
    stats.value = statsRes.data
    console.log('更新后的统计数据:', stats.value)
  } catch (error) {
    console.error('获取数据失败:', error)
  }
})
</script>

<style scoped>
/* 容器样式 */
.account-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 头部样式 */
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

.header-content .title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.subtitle {
  margin: 10px 0 0;
  opacity: 0.9;
  font-size: 16px;
}

.admin-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 搜索框样式 */
.search-box {
  margin-bottom: 30px;
}

.search-wrapper {
  position: relative;
  margin-bottom: 15px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

/* 平台标签样式 */
.platform-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.platform-tag {
  background: var(--bg-light);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-tag:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.platform-tag.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

/* 账号卡片样式 */
.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.account-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.value-container {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 按钮样式 */
.copy-btn, .toggle-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  background: var(--primary-color);
  color: white;
  transition: all 0.3s ease;
}

.copy-btn:hover, .toggle-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

/* 复制提示样式 */
.copy-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 1000;
  animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  20% { opacity: 1; transform: translate(-50%, 0); }
  80% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

/* 时间显示样式 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .platform-tags {
    justify-content: center;
  }

  .account-grid {
    grid-template-columns: 1fr;
  }

  .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .value-container {
    width: 100%;
    justify-content: space-between;
  }
}

/* 通知消息样式 */
.notifications {
  margin-bottom: 30px;
  animation: slideDown 0.5s ease;
}

.notification-item {
  background: white;
  border-radius: var(--border-radius);
  padding: 15px 20px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-color);
  transition: transform 0.3s ease;
}

.notification-item:hover {
  transform: translateX(5px);
}

.notification-item.info {
  border-left-color: var(--primary-color);
}

.notification-item.warning {
  border-left-color: var(--warning-color);
}

.notification-item.danger {
  border-left-color: var(--danger-color);
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.notification-title i {
  font-size: 18px;
}

.notification-item.info i {
  color: var(--primary-color);
}

.notification-item.warning i {
  color: var(--warning-color);
}

.notification-item.danger i {
  color: var(--danger-color);
}

.notification-content {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-left: 28px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .notifications {
    margin: 0 -10px 20px -10px;
  }

  .notification-item {
    border-radius: 0;
    margin-bottom: 8px;
  }

  .notification-content {
    margin-left: 0;
    margin-top: 8px;
  }
}

/* Footer 提示样式 */
.footer-tips {
  background: var(--bg-light);
  padding: 25px;
  border-radius: var(--border-radius);
  margin-top: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.5s ease;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: var(--primary-color);
}

.tips-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.tips-header i {
  font-size: 24px;
}

.footer-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-tips li {
  margin: 12px 0;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color);
  transition: all 0.3s ease;
}

.footer-tips li:last-child {
  border-bottom: none;
}

.footer-tips li:hover {
  color: var(--text-primary);
  transform: translateX(5px);
}

.footer-tips li i {
  color: var(--primary-color);
  font-size: 16px;
}

.footer-tips li:nth-child(1) i {
  color: var(--warning-color);
}

.footer-tips li:nth-child(2) i {
  color: var(--danger-color);
}

.footer-tips li:nth-child(3) i {
  color: var(--success-color);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .footer-tips {
    margin: 20px -10px -20px -10px;
    border-radius: 0;
  }

  .footer-tips li {
    padding: 12px 0;
  }
}

/* 添加动画 */
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

.visit-stats {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  color: white;
}

.stat-item i {
  font-size: 16px;
}

@media (max-width: 768px) {
  .visit-stats {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}
</style> 