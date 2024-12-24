<template>
  <div class="notification-manage">
    <div class="page-header">
      <h2>通知管理</h2>
      <button @click="showAddModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        发布通知
      </button>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list">
      <div v-for="notification in notifications" :key="notification.id" 
        :class="['notification-card', notification.type]">
        <div class="notification-header">
          <div class="notification-type">
            <i :class="getNotificationIcon(notification.type)"></i>
            {{ getNotificationType(notification.type) }}
          </div>
          <div class="notification-actions">
            <button @click="editNotification(notification)" class="btn btn-info">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteNotification(notification.id)" class="btn btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="notification-content">
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.content }}</p>
          <div class="notification-time">
            <i class="far fa-clock"></i>
            {{ formatDate(notification.create_time) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑通知弹窗 -->
    <div class="modal" v-if="showAddModal || editingNotification">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingNotification ? '编辑通知' : '发布通知' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题</label>
            <input v-model="formData.title" class="input" placeholder="请输入通知标题" />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="formData.content" class="input" rows="4" placeholder="请输入通知内容"></textarea>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="formData.type" class="input">
              <option value="info">普通信息</option>
              <option value="warning">警告</option>
              <option value="danger">重要</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">取消</button>
          <button @click="saveNotification" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- 显示错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 显示加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNotifications, addNotification, updateNotification, deleteNotification as deleteNotificationApi } from '../../api'

const notifications = ref([])
const showAddModal = ref(false)
const editingNotification = ref(null)
const formData = ref({
  title: '',
  content: '',
  type: 'info'
})

const loading = ref(false)
const error = ref(null)

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await getNotifications()
    notifications.value = response.data
    console.log('获取到的通知:', notifications.value)
  } catch (err) {
    console.error('获取通知失败:', err)
    error.value = '获取通知列表失败'
  } finally {
    loading.value = false
  }
}

// 编辑通知
const editNotification = (notification) => {
  editingNotification.value = { ...notification }  // 创建副本
  formData.value = { 
    title: notification.title,
    content: notification.content,
    type: notification.type || 'info'
  }
  showAddModal.value = true
}

// 删除通知
const deleteNotification = async (id) => {
  if (confirm('确定要删除这条通知吗？')) {
    try {
      await deleteNotificationApi(id)
      await fetchNotifications()
    } catch (error) {
      console.error('删除通知失败:', error)
    }
  }
}

// 保存通知
const saveNotification = async () => {
  try {
    // 表单验证
    if (!formData.value.title?.trim() || !formData.value.content?.trim()) {
      alert('请填写完整的通知信息')
      return
    }

    const notificationData = {
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      type: formData.value.type || 'info'
    }

    console.log('准备保存通知:', { 
      isEdit: !!editingNotification.value,
      id: editingNotification.value?.id,
      data: notificationData 
    })

    let response
    if (editingNotification.value) {
      // 更新通知
      response = await updateNotification(editingNotification.value.id, notificationData)
      console.log('更新响应:', response.data)
    } else {
      // 添加新通知
      response = await addNotification(notificationData)
      console.log('添加响应:', response.data)
    }

    if (response?.data) {
      alert(editingNotification.value ? '更新成功' : '添加成功')
      await fetchNotifications() // 刷新列表
      closeModal()
    } else {
      throw new Error('操作失败，未收到响应数据')
    }
  } catch (error) {
    console.error('保存通知失败:', error)
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.details || 
                        error.message || 
                        '操作失败，请重试'
    alert(errorMessage)
  }
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  editingNotification.value = null
  formData.value = {
    title: '',
    content: '',
    type: 'info'
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

// 获取通知图标
const getNotificationIcon = (type) => {
  const icons = {
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle'
  }
  return icons[type] || icons.info
}

// 获取通知类型文本
const getNotificationType = (type) => {
  const types = {
    info: '普通信息',
    warning: '警告',
    danger: '重要'
  }
  return types[type] || '普通信息'
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.notification-list {
  display: grid;
  gap: 20px;
}

.notification-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  border-left: 4px solid var(--primary-color);
}

.notification-card.warning {
  border-left-color: var(--warning-color);
}

.notification-card.danger {
  border-left-color: var(--danger-color);
}

.notification-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.notification-type {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.notification-content {
  padding: 20px;
}

.notification-content h3 {
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

.notification-content p {
  color: var(--text-secondary);
  margin: 0 0 15px 0;
  line-height: 1.6;
}

.notification-time {
  color: var(--text-light);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notification-actions {
  display: flex;
  gap: 8px;
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

textarea.input {
  resize: vertical;
  min-height: 100px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
}

@media (max-width: 768px) {
  .notification-header {
    flex-direction: column;
    gap: 10px;
  }

  .notification-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 