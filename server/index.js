import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import config from '../config/index.js'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { startScheduler, scheduledTasks } from './tasks/scheduler.js'
import { generateSteamGuardCode } from './utils/steamToken.js'
import { v4 as uuidv4 } from 'uuid'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 中间件配置
app.use(cors(config.security.cors))
app.use(express.json())
app.use(cookieParser())

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

// 在现有的中间件配置之后添加
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const date = new Date();
  const timestamp = date.toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const logEntry = `${timestamp} - ${ip}\n`;
  
  fs.appendFile(
    join(__dirname, '../data/ip_logs.txt'),
    logEntry,
    (err) => {
      if (err) {
        console.error('记录IP失败:', err);
      }
    }
  );
  next();
});

// API 路由
// 获取所有账号
app.get('/api/accounts', async (req, res) => {
  try {
    console.log('请求获取账号列表')
    const [rows] = await pool.query(`
      SELECT id, username, password, platform, status, tags, code,
             shared_secret, identity_secret, steamid,
             DATE_FORMAT(add_time, '%Y-%m-%d %H:%i:%s') as add_time 
      FROM accounts 
      ORDER BY id DESC
    `)
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
  const { username, password, platform, status = '正常', tags, code, shared_secret, identity_secret, steamid } = req.body
  try {
    // 检查必填字段
    if (!username || !password || !platform) {
      return res.status(400).json({ error: '用户名、密码和平���为必填项' })
    }

    const [result] = await pool.query(
      `INSERT INTO accounts (username, password, platform, status, tags, code, 
                           shared_secret, identity_secret, steamid, add_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [username, password, platform, status, tags, code, shared_secret, identity_secret, steamid]
    )
    
    const [account] = await pool.query(
      `SELECT id, username, password, platform, status, tags, code,
              shared_secret, identity_secret, steamid,
              DATE_FORMAT(add_time, '%Y-%m-%d %H:%i:%s') as add_time 
       FROM accounts WHERE id = ?`,
      [result.insertId]
    )
    
    console.log('账号添加成功:', account[0])
    res.json(account[0])
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
  const { username, password, platform, status, tags, code, shared_secret, identity_secret, steamid } = req.body
  try {
    // 检查账号是否存在
    const [existing] = await pool.query('SELECT * FROM accounts WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ error: '账号不存在' })
    }

    // 更新账号信息
    await pool.query(
      `UPDATE accounts 
       SET username = ?, password = ?, platform = ?, status = ?, tags = ?, 
           code = ?, shared_secret = ?, identity_secret = ?, steamid = ?, 
           add_time = NOW() 
       WHERE id = ?`,
      [username, password, platform, status, tags, code, shared_secret, identity_secret, steamid, id]
    )
    
    // 获取更新后的账号信息
    const [account] = await pool.query(
      `SELECT id, username, password, platform, status, tags, code, 
              shared_secret, identity_secret, steamid,
              DATE_FORMAT(add_time, '%Y-%m-%d %H:%i:%s') as add_time 
       FROM accounts WHERE id = ?`,
      [id]
    )
    
    console.log('账号更新成功:', account[0])
    res.json(account[0])
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
    // 检查账号是否存在
    const [existing] = await pool.query('SELECT * FROM accounts WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ error: '账号不存在' })
    }

    // 删除账号
    await pool.query('DELETE FROM accounts WHERE id = ?', [id])
    console.log('账号删除成功:', { id, account: existing[0] })
    res.json({ 
      message: '删除成功',
      deletedAccount: existing[0]
    })
  } catch (error) {
    console.error('删除账号失败:', error)
    res.status(500).json({ 
      error: error.message,
      details: '删除账号失败'
    })
  }
})

// 添加批量更新状态的路由
app.put('/api/accounts/status/batch', async (req, res) => {
  const { ids, status } = req.body
  try {
    if (!Array.isArray(ids) || !status) {
      return res.status(400).json({ error: '参数格式错误' })
    }

    await pool.query(
      'UPDATE accounts SET status = ? WHERE id IN (?)',
      [status, ids]
    )

    console.log('批量更新状态成功:', { ids, status })
    res.json({ 
      message: '状态更新成功',
      updatedIds: ids,
      newStatus: status
    })
  } catch (error) {
    console.error('批量更新状态失败:', error)
    res.status(500).json({ error: '批量更新状态失败' })
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
    visitorIds: []
  }
  fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2))
}

// 读取统计数据
const readStats = () => {
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf8')
    const stats = JSON.parse(data)
    return {
      totalVisits: stats.totalVisits || 0,
      totalVisitors: stats.totalVisitors || 0,
      visitorIds: stats.visitorIds || []
    }
  } catch (error) {
    console.error('读取统计数据失败:', error)
    return {
      totalVisits: 0,
      totalVisitors: 0,
      visitorIds: []
    }
  }
}

// 保存统计数据
const saveStats = (stats) => {
  try {
    const statsToSave = {
      totalVisits: stats.totalVisits,
      totalVisitors: stats.totalVisitors,
      visitorIds: stats.visitorIds
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify(statsToSave, null, 2))
  } catch (error) {
    console.error('保存统计数据失败:', error)
  }
}

// 访问统计路由
app.get('/api/stats', (req, res) => {
  try {
    // 获取或设置访客ID
    let visitorId = req.cookies.visitorId
    if (!visitorId) {
      visitorId = uuidv4()
      res.cookie('visitorId', visitorId, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 一年有效期
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production'
      })
    }
    
    const stats = readStats()
    console.log('访问统计 - 当前统计数据:', stats)
    
    // 增加总访问量
    stats.totalVisits++
    
    // 使用访客ID更新总访客数
    if (!stats.visitorIds.includes(visitorId)) {
      stats.visitorIds.push(visitorId)
      stats.totalVisitors = stats.visitorIds.length
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

// 添加批量删除的路由
app.delete('/api/accounts/batch', async (req, res) => {
  const { ids } = req.body
  try {
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: '参数格式错误' })
    }

    // 先检查账号是否都存在
    const [existing] = await pool.query(
      'SELECT * FROM accounts WHERE id IN (?)',
      [ids]
    )

    if (existing.length !== ids.length) {
      return res.status(404).json({ error: '部分账号不存在' })
    }

    // 执行批量删除
    await pool.query('DELETE FROM accounts WHERE id IN (?)', [ids])
    
    console.log('批量删除成功:', { deletedIds: ids })
    res.json({ 
      message: '删除成功',
      deletedIds: ids,
      deletedAccounts: existing
    })
  } catch (error) {
    console.error('批量删除失败:', error)
    res.status(500).json({ error: '批量删除失败' })
  }
})

// 在��动服务器之前启动定时任务
startScheduler()

// 添加手动触发任务的路由
app.post('/api/tasks/:taskName', async (req, res) => {
  const { taskName } = req.params
  
  if (!scheduledTasks[taskName]) {
    return res.status(404).json({ error: '任务不存在' })
  }
  
  try {
    console.log(`手动触发任务: ${taskName}`)
    await scheduledTasks[taskName]()
    res.json({ message: '任务执行成功' })
  } catch (error) {
    console.error(`执行任务失败 ${taskName}:`, error)
    res.status(500).json({ error: '任务执行失败' })
  }
})

// 获取所有可用任务列表
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: Object.keys(scheduledTasks).map(name => ({
      name,
      description: getTaskDescription(name)
    }))
  })
})

// 任务描述映射
function getTaskDescription(taskName) {
  const descriptions = {
    checkAccountStatus: '检查所有账号状态',
    cleanNotifications: '清理过期通知',
    backupDatabase: '备份数据库'
  }
  return descriptions[taskName] || '未知任务'
}

// 添加批量导入账号的路由
app.post('/api/accounts/batch', async (req, res) => {
  const accounts = req.body
  try {
    if (!Array.isArray(accounts) || !accounts.length) {
      return res.status(400).json({ error: '无效的账号数据' })
    }

    // 验证必填字段
    for (const account of accounts) {
      if (!account.username || !account.password) {
        return res.status(400).json({ 
          error: '账号数据格式错误',
          details: '用户名和密码为必填项'
        })
      }
    }

    // 批量插入账号
    const values = accounts.map(acc => [
      acc.username,
      acc.password,
      acc.platform || '',
      acc.status || '正常',
      acc.tags || '',
      new Date()
    ])

    const [result] = await pool.query(
      `INSERT INTO accounts (username, password, platform, status, tags, add_time) 
       VALUES ?`,
      [values]
    )

    // 获取插入的账号
    const [insertedAccounts] = await pool.query(
      `SELECT id, username, password, platform, status, tags, 
              DATE_FORMAT(add_time, '%Y-%m-%d %H:%i:%s') as add_time 
       FROM accounts 
       WHERE id >= ? 
       ORDER BY id ASC 
       LIMIT ?`,
      [result.insertId, result.affectedRows]
    )

    console.log(`成功导入 ${result.affectedRows} 个账号`)
    res.json(insertedAccounts)
  } catch (error) {
    console.error('批量导入账号失败:', error)
    res.status(500).json({ 
      error: error.message,
      details: '批量导入账号失败'
    })
  }
})

// 添加Steam令牌生成接口
app.post('/api/steam/token', async (req, res) => {
  const { shared_secret } = req.body
  try {
    if (!shared_secret) {
      return res.status(400).json({ error: 'shared_secret是必需的' })
    }

    const token = generateSteamGuardCode(shared_secret)
    if (!token) {
      throw new Error('令牌生成失败')
    }

    res.json({ token })
  } catch (error) {
    console.error('生成Steam令牌失败:', error)
    res.status(500).json({ 
      error: error.message,
      details: '生成Steam令牌失���'
    })
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