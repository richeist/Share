<template>
  <div class="admin-layout">
    <div class="sidebar">
      <div class="sidebar-header">
        <i class="fas fa-shield-alt"></i>
        <span>管理后台</span>
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
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          退出登录
        </button>
      </div>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--primary-color);
  color: white;
}

.sidebar-header i {
  font-size: 24px;
}

.sidebar-header span {
  font-size: 18px;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.nav-item:hover {
  background: var(--bg-light);
  color: var(--primary-color);
}

.nav-item.router-link-active {
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary-color);
  font-weight: 500;
  border-right: 3px solid var(--primary-color);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.logout-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--border-radius);
  background: var(--danger-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: var(--danger-dark);
  transform: translateY(-1px);
}

.logout-btn i {
  font-size: 16px;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 20px;
  background: var(--bg-light);
  min-height: 100vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .sidebar-nav {
    flex-direction: row;
    justify-content: center;
    padding: 10px;
    flex-wrap: wrap;
  }

  .nav-item {
    padding: 8px 16px;
  }

  .main-content {
    margin-left: 0;
  }

  .logout-btn {
    padding: 8px;
  }
}
</style> 