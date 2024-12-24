export default {
  // 数据库配置
  db: {
    host: 'localhost',
    user: 'root',
    password: '2528',
    database: 'account_sharing',
    port: 3306,
    connectionLimit: 10,
    queueLimit: 0
  },
  
  // 服务器配置
  server: {
    port: 3000,
    host: 'localhost',
    env: 'development'
  },
  
  // 前端配置
  client: {
    port: 5500,
    host: 'localhost',
    baseUrl: 'http://localhost:5500',
    apiUrl: 'http://localhost:3000/api'
  },
  
  // 安全配置
  security: {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    jwt: {
      secret: 'dev-secret-key',
      expiresIn: '24h'
    }
  }
} 