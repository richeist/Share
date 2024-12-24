import schedule from 'node-schedule'
import mysql from 'mysql2/promise'
import config from '../../config/index.js'

// 创建数据库连接池
const pool = mysql.createPool(config.db)

// 定义任务列表
const tasks = {
  // 检查账号状态的任务
  checkAccountStatus: async () => {
    try {
      console.log('开始执行账号状态检查任务:', new Date().toLocaleString())
      
      // 获取所有正常状态的账号
      const [accounts] = await pool.query(
        'SELECT id, username, password, platform FROM accounts WHERE status = ?',
        ['正常']
      )
      
      for (const account of accounts) {
        try {
          // 这里添加实际的账号检测逻辑
          const isValid = await checkAccountValidity(account)
          
          if (!isValid) {
            // 更新账号状态为异常
            await pool.query(
              'UPDATE accounts SET status = ? WHERE id = ?',
              ['异常', account.id]
            )
            console.log(`账号检测失败，已标记为异常: ${account.id}`)
            
            // 添加通知
            await pool.query(
              'INSERT INTO notifications (title, content, type, create_time) VALUES (?, ?, ?, NOW())',
              ['账号状态异常', `平台 ${account.platform} 的账号 ${account.username} 状态异常，请及时处理。`, 'warning']
            )
          }
        } catch (error) {
          console.error(`检查账号失败 ${account.id}:`, error)
        }
      }
      
      console.log('账号状态检查任务完成:', new Date().toLocaleString())
    } catch (error) {
      console.error('执行账号状态检查任务失败:', error)
    }
  },
  
  // 清理过期通知的任务
  cleanNotifications: async () => {
    try {
      console.log('开始执行通知清理任务:', new Date().toLocaleString())
      
      // 删除30天前的通知
      const [result] = await pool.query(
        'DELETE FROM notifications WHERE create_time < DATE_SUB(NOW(), INTERVAL 30 DAY)'
      )
      
      console.log(`清理了 ${result.affectedRows} 条过期通知`)
    } catch (error) {
      console.error('执行通知清理任务失败:', error)
    }
  },
  
  // 数据库备份任务
  backupDatabase: async () => {
    try {
      console.log('开始执行数据库备份任务:', new Date().toLocaleString())
      // 这里添加数据库备份逻辑
      // 可以使用 mysqldump 或其他备份工具
    } catch (error) {
      console.error('执行数据库备份任务失败:', error)
    }
  }
}

// 模拟检查账号有效性的函数
async function checkAccountValidity(account) {
  // 这里添加实际的账号检测逻辑
  // 例如：尝试登录、检查账号状态等
  return Math.random() > 0.1 // 模拟 90% 的成功率
}

// 定义定时任务调度器
export function startScheduler() {
  // 每天凌晨3点执行账号状态检查
  schedule.scheduleJob('0 3 * * *', tasks.checkAccountStatus)
  
  // 每周日凌晨4点执行通知清理
  schedule.scheduleJob('0 4 * * 0', tasks.cleanNotifications)
  
  // 每天凌晨2点执行数据库备份
  schedule.scheduleJob('0 2 * * *', tasks.backupDatabase)
  
  console.log('定时任务调度器已启动')
}

// 导出任务列表，方便手动触发
export const scheduledTasks = tasks 