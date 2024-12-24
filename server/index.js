import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import config from '../config/index.js'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 中间件配置
app.use(cors(config.security.cors))
app.use(express.json())

// 数据库配置
const pool = mysql.createPool(config.db)

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('数据库连接成功!')
    console.log('环境:', config.server.env)
    console.log('数据库配置:', {
      host: config.db.host,
      user: config.db.user,
      database: config.db.database
    })
    connection.release()
  } catch (err) {
    console.error('数据库连接失败:', err)
    process.exit(1)
  }
}

// API 路由
// 获取所有账号
app.get('/api/accounts', async (req, res) => {
  try {
    console.log('请求获取账号列表')
    const [rows] = await pool.query('SELECT * FROM accounts ORDER BY id DESC')
    console.log('获取到账号数量:', rows.length)
    res.json(rows)
  } catch (error) {
    console.error('获取账号列表失败:', error)
    res.status(500).json({ 
      error: error.message,
      details: '获取账号列表失败'
    })
  }
})

// 添加账号
app.post('/api/accounts', async (req, res) => {
  const { username, password, platform, tags, add_time } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO accounts (username, password, platform, tags, add_time) VALUES (?, ?, ?, ?, ?)',
      [username, password, platform, tags, add_time || new Date()]
    )
    
    const [newAccount] = await pool.query(
      'SELECT * FROM accounts WHERE id = ?',
      [result.insertId]
    )
    
    res.json(newAccount[0])
  } catch (error) {
    console.error('添加账号失败:', error)
    res.status(500).json({ 
      error: error.message,
      details: '添加账号失败'
    })
  }
})

// 更新账号
app.put('/api/accounts/:id', async (req, res) => {
  const { id } = req.params
  const { username, password, platform } = req.body
  try {
    // 先检查账号是否存在
    const [existing] = await pool.query('SELECT * FROM accounts WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ error: '账号不存在' })
    }

    // 更新账号信息
    await pool.query(
      'UPDATE accounts SET username = ?, password = ?, platform = ?, add_time = NOW() WHERE id = ?',
      [username, password, platform, id]
    )
    
    // 获取更新后的账号信息
    const [updatedAccount] = await pool.query('SELECT * FROM accounts WHERE id = ?', [id])
    
    res.json(updatedAccount[0])
  } catch (error) {
    console.error('更新账号失败:', error)
    res.status(500).json({ 
      error: error.message,
      details: '更新账号失败'
    })
  }
})

// 删除账号
app.delete('/api/accounts/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM accounts WHERE id = ?', [id])
    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除账号失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 管理员登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const [rows] = await pool.query(
      'SELECT * FROM admin WHERE username = ? AND password = ?',
      [username, password]
    )
    if (rows.length > 0) {
      res.json({ success: true })
    } else {
      res.status(401).json({ error: '用户名或密码错误' })
    }
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 获取所有通知
app.get('/api/notifications', async (req, res) => {
  try {
    console.log('请求获取通知列表')
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY create_time DESC')
    console.log('获取到通知数量:', rows.length)
    res.json(rows)
  } catch (error) {
    console.error('获取通知列表失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 根据标签获取账号
app.get('/api/accounts/tags/:tag', async (req, res) => {
  const { tag } = req.params
  try {
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE tags LIKE ? ORDER BY id DESC',
      [`%${tag}%`]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 添加通知
app.post('/api/notifications', async (req, res) => {
  const { title, content, type } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO notifications (title, content, type, create_time) VALUES (?, ?, ?, NOW())',
      [title, content, type]
    )
    
    const [newNotification] = await pool.query(
      'SELECT * FROM notifications WHERE id = ?',
      [result.insertId]
    )
    
    res.json(newNotification[0])
  } catch (error) {
    console.error('添加通知失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 更新通知
app.put('/api/notifications/:id', async (req, res) => {
  const { id } = req.params
  const { title, content, type } = req.body
  
  console.log('收到更新请求:', { id, body: req.body })
  
  try {
    // 先检查通知是否存在
    const [existing] = await pool.query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    )
    
    if (existing.length === 0) {
      console.log('通知不存在:', id)
      return res.status(404).json({ error: '通知不存在' })
    }

    // 执行更新
    const [result] = await pool.query(
      'UPDATE notifications SET title = ?, content = ?, type = ? WHERE id = ?',
      [title, content, type, id]
    )

    if (result.affectedRows === 0) {
      throw new Error('更新失败')
    }
    
    // 获取更新后的通知
    const [updated] = await pool.query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    )
    
    console.log('更新成功:', updated[0])
    res.json(updated[0])
  } catch (error) {
    console.error('更新通知失败:', error)
    res.status(500).json({ 
      error: '更新通知失败',
      details: error.message,
      stack: error.stack
    })
  }
})

// 删除通知
app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [id])
    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除通知失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 根据平台获取账号
app.get('/api/accounts/platform/:platform', async (req, res) => {
  const { platform } = req.params
  try {
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE platform = ? ORDER BY id DESC',
      [platform]
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取所有平台列表
app.get('/api/platforms', async (req, res) => {
  try {
    console.log('请求获取平台列表')
    const [rows] = await pool.query('SELECT DISTINCT platform FROM accounts ORDER BY platform')
    console.log('获取到平台数量:', rows.length)
    res.json(rows.map(row => row.platform))
  } catch (error) {
    console.error('获取平台列表失败:', error)
    res.status(500).json({ error: error.message })
  }
})

// 获取所有标签列表
app.get('/api/tags', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT tags FROM accounts WHERE tags IS NOT NULL')
    const allTags = new Set()
    rows.forEach(row => {
      if (row.tags) {
        row.tags.split(',').forEach(tag => allTags.add(tag.trim()))
      }
    })
    res.json(Array.from(allTags))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API 路由错误处理中间件
app.use((err, req, res, next) => {
  console.error('路由错误:', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  })
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误',
    details: err.stack
  })
})

// 在现有路由之前添加访问统计相关的函数和路由
const STATS_FILE = join(__dirname, '../data/stats.txt')

// 确保数据目录存在
const dataDir = join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

// 初始化统计文件
if (!fs.existsSync(STATS_FILE)) {
  const initialStats = {
    totalVisits: 0,
    totalVisitors: 0,
    allVisitors: []
  }
  fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2))
} else {
  // 读取并转换现有文件到新格式
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf8')
    const oldStats = JSON.parse(data)
    if (oldStats.visitors && !oldStats.allVisitors) {
      const allIPs = new Set()
      Object.values(oldStats.visitors).forEach(dayVisitors => {
        dayVisitors.forEach(ip => allIPs.add(ip))
      })
      
      const newStats = {
        totalVisits: oldStats.totalVisits || 0,
        totalVisitors: allIPs.size,
        allVisitors: Array.from(allIPs)
      }
      fs.writeFileSync(STATS_FILE, JSON.stringify(newStats, null, 2))
    }
  } catch (error) {
    console.error('转换统计文件失败:', error)
  }
}

// 读取统计数据
const readStats = () => {
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf8')
    const stats = JSON.parse(data)
    return {
      totalVisits: stats.totalVisits || 0,
      totalVisitors: stats.totalVisitors || 0,
      allVisitors: stats.allVisitors || []
    }
  } catch (error) {
    console.error('读取统计数据失败:', error)
    return {
      totalVisits: 0,
      totalVisitors: 0,
      allVisitors: []
    }
  }
}

// 保存统计数据
const saveStats = (stats) => {
  try {
    const statsToSave = {
      totalVisits: stats.totalVisits,
      totalVisitors: stats.totalVisitors,
      allVisitors: stats.allVisitors
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(statsToSave, null, 2))
  } catch (error) {
    console.error('保存统计数据失败:', error)
  }
}

// 访问统计路由
app.get('/api/stats', (req, res) => {
  try {
    const clientIP = req.ip
    console.log('访问统计 - 客户端IP:', clientIP)
    
    const stats = readStats()
    console.log('访问统计 - 当前统计数据:', stats)
    
    // 增加总访问量
    stats.totalVisits++
    
    // 更新总访客数（如果是新访客）
    if (!stats.allVisitors.includes(clientIP)) {
      stats.allVisitors.push(clientIP)
      stats.totalVisitors = stats.allVisitors.length
      console.log('访问统计 - 新访客已添加')
    }
    
    // 保存更新后的统计数据
    saveStats(stats)
    console.log('访问统计 - 已保存更新后的数据:', stats)
    
    // 返回统计数据
    res.json({
      totalVisits: stats.totalVisits,
      totalVisitors: stats.totalVisitors
    })
  } catch (error) {
    console.error('处理访问统计失败:', error)
    res.status(500).json({ error: '获取访问统计失败' })
  }
})

// 启动服务器
const PORT = config.server.port
const HOST = config.server.host

app.listen(PORT, HOST, () => {
  console.log(`服务器运行在 ${HOST}:${PORT}`)
  console.log(`环境: ${config.server.env}`)
  testConnection()
})

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的 Promise 拒绝:', error)
})

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
}) 