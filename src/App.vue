<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
</script>

<style>
:root {
  --primary-color: #1976D2;
  --primary-dark: #1565C0;
  --primary-rgb: 25, 118, 210;
  --text-primary: #2c3e50;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --bg-light: #f5f5f5;
  --bg-primary: #f8f9fa;
  --box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --border-radius: 12px;
  
  /* 添加新的颜色变量 */
  --success-color: #4CAF50;
  --success-dark: #43A047;
  --warning-color: #FF9800;
  --warning-dark: #F57C00;
  --danger-color: #F44336;
  --danger-dark: #D32F2F;
  --info-color: #2196F3;
  --info-dark: #1E88E5;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--bg-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  min-height: 100vh;
}

/* 通用按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-success:hover {
  background: var(--success-dark);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: var(--danger-dark);
}

.btn-info {
  background: var(--info-color);
  color: white;
}

.btn-info:hover {
  background: var(--info-dark);
}

/* 通用输入框样式 */
.input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
  outline: none;
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* 通用卡片样式 */
.card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
}

/* 通用标题样式 */
.title {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-weight: 600;
}

/* 通用动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 通用提示框样式 */
.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: var(--border-radius);
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .btn {
    width: 100%;
  }
  
  .input {
    font-size: 16px; /* 防止 iOS 缩放 */
  }
}
</style> 