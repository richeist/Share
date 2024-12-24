<template>
  <div class="admin-layout">
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <i class="fas fa-shield-alt"></i>
        <h2>管理后台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin/accounts" class="nav-item">
          <i class="fas fa-users"></i>
          账号管理
        </router-link>
        <router-link to="/admin/notifications" class="nav-item">
          <i class="fas fa-bell"></i>
          通知管理
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="logout" class="btn btn-danger">
          <i class="fas fa-sign-out-alt"></i>
          退出登录
        </button>
      </div>
    </div>
    <div class="admin-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('isAdmin')
  router.push('/')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 250px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header i {
  font-size: 24px;
  color: var(--primary-color);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: var(--primary-color);
  color: white;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.admin-content {
  flex: 1;
  padding: 20px;
  background: var(--bg-primary);
}
</style> 