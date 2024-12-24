import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const deploy = async () => {
  try {
    // 创建日志目录
    const logsDir = join(rootDir, 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir)
    }

    // 停止现有服务
    console.log('停止现有服务...')
    try {
      execSync('npx pm2 delete all', { stdio: 'inherit' })
    } catch (error) {
      console.log('没有运行中的服务')
    }

    // 构建前端
    console.log('构建前端...')
    execSync('npm run build', { stdio: 'inherit' })

    // 使用PM2启动后端服务
    console.log('启动后端服务...')
    execSync('npx pm2 start ecosystem.config.cjs --env production', { 
      stdio: 'inherit',
      cwd: rootDir
    })

    // 保存PM2进程列表，确保服务器重启后进程会自动启动
    console.log('保存PM2进程列表...')
    execSync('npx pm2 save', { stdio: 'inherit' })

    console.log('部署完成!')
  } catch (error) {
    console.error('部署失败:', error)
    process.exit(1)
  }
}

deploy() 