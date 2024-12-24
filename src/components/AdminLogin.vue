<template>
  <div class="login-container">
    <div class="login-box card">
      <div class="login-header">
        <i class="fas fa-shield-alt"></i>
        <h2 class="title">管理员登录</h2>
      </div>
      <div class="login-form">
        <div class="form-group">
          <label>
            <i class="fas fa-user"></i>
            用户名
          </label>
          <input 
            v-model="username" 
            type="text" 
            class="input" 
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label>
            <i class="fas fa-lock"></i>
            密码
          </label>
          <input 
            v-model="password" 
            type="password" 
            class="input" 
            placeholder="请输入密码"
          />
        </div>
        <button @click="handleLogin" class="btn btn-primary login-btn">
          <i class="fas fa-sign-in-alt"></i>
          登录
        </button>
        <router-link to="/" class="back-link">
          <i class="fas fa-arrow-left"></i>
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '../api'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await adminLogin({ username: username.value, password: password.value })
    localStorage.setItem('isAdmin', 'true')
    router.push('/admin')
  } catch (error) {
    alert('用户名或密码错误！')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.login-box {
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header i {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label i {
  color: var(--primary-color);
}

.input {
  padding: 12px;
  font-size: 16px;
  border: 2px solid var(--border-color);
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.login-btn {
  padding: 12px;
  font-size: 16px;
  margin-top: 10px;
}

.back-link {
  text-align: center;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 8px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.back-link:hover {
  color: var(--primary-color);
  background: var(--bg-light);
}

@media (max-width: 768px) {
  .login-box {
    margin: 20px;
  }
}
</style> 