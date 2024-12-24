export default {
  // 数据库配置
  db: {
    host: 'localhost',
    user: 'share',
    password: 'iFyF5TNNQX6MYb8T',
    database: 'share',
    port: 3306,
    connectionLimit: 10,
    queueLimit: 0
  },
  
  // 服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0',
    env: 'production'
  },
  
  // 前端配置
  client: {
    baseUrl: 'http://share.lyyy.us.kg',
    apiUrl: 'http://share.lyyy.us.kg/api'
  },
  
  // 安全配置
  security: {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    jwt: {
      secret: 'prod-secret-key',
      expiresIn: '24h'
    }
  }
} 