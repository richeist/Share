import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',  // 使用相对路径，会被代理到后端
  timeout: 5000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('发送请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: config.baseURL + config.url,
      data: config.data,
      params: config.params
    })
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('请求成功:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response
  },
  error => {
    console.error('请求失败:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

// API 函数
export const getAccounts = async () => {
  try {
    const response = await api.get('/accounts')
    console.log('获取账号列表成功:', response.data)
    return response
  } catch (error) {
    console.error('获取账号列表失败:', error)
    throw error
  }
}

export const addAccount = async (account) => {
  try {
    const response = await api.post('/accounts', account)
    return response
  } catch (error) {
    console.error('添加账号失败:', error)
    throw error
  }
}

export const updateAccount = async (id, account) => {
  try {
    const response = await api.put(`/accounts/${id}`, account)
    return response
  } catch (error) {
    console.error('更新账号失败:', error)
    throw error
  }
}

export const deleteAccount = async (id) => {
  try {
    const response = await api.delete(`/accounts/${id}`)
    return response
  } catch (error) {
    console.error('删除账号失败:', error)
    throw error
  }
}

export const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/login', credentials)
    return response
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications')
    return response
  } catch (error) {
    console.error('获取通知列表失败:', error)
    throw error
  }
}

export const addNotification = async (notification) => {
  try {
    const response = await api.post('/notifications', notification)
    return response
  } catch (error) {
    console.error('添加通知失败:', error)
    throw error
  }
}

export const updateNotification = async (id, notification) => {
  try {
    console.log('发送更新请求:', { id, notification })
    const response = await api.put(`/notifications/${id}`, notification)
    console.log('更新响应:', response.data)
    return response
  } catch (error) {
    console.error('更新通知失败:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    throw error
  }
}

export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`)
    return response
  } catch (error) {
    console.error('删除通知失败:', error)
    throw error
  }
}

export const getAccountsByTag = (tag) => api.get(`/accounts/tags/${tag}`)
export const getAccountsByPlatform = (platform) => api.get(`/accounts/platform/${platform}`)
export const getPlatforms = () => api.get('/platforms')
export const getTags = () => api.get('/tags')

export const getVisitStats = async () => {
  try {
    const response = await api.get('/stats')
    console.log('访问统计API响应:', response.data)
    return response
  } catch (error) {
    console.error('获取访问统计失败:', error)
    throw error
  }
} 