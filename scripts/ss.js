import axios from 'axios';
import mysql from 'mysql2/promise';

// MySQL 数据库连接配置
const dbConfig = {
  host: 'localhost', // MySQL 服务器地址
  user: 'root',      // 数据库用户名
  password: '2528',      // 数据库密码
  database: 'account_sharing'  // 数据库名
};

// 动态参数
const params = {
  page: 1,  // 设置分页参数
  limit: 10  // 设置返回的记录数
};

// 获取数据并保存到数据库
async function fetchDataAndSave() {
  try {
    // 获取数据
    const { data } = await axios.get('https://idapi.bocchi2b.top/list', { params });
    
    // 打印返回的数据结构，查看是否是对象且包含id数组
    console.log('返回的数据:', data);

    // 确保返回的数据结构符合预期
    if (data && Array.isArray(data.id)) {
      // 连接 MySQL 数据库
      const connection = await mysql.createConnection(dbConfig);

      // 遍历每个用户并将其信息保存到数据库
      for (const item of data.id) {
        const { email, password, status } = item;

        // 将email映射为username，插入数据到数据库
        await connection.execute(
          'INSERT INTO accounts (username, password, status,platform) VALUES (?, ?,?, ?)',
          [email, password, status,'Shadowrocket']
        );
        console.log(`用户 ${email} 已保存`);
      }

      // 关闭数据库连接
      await connection.end();
      console.log('所有数据已保存');
    } else {
      console.error('数据格式不符合预期，id属性缺失或不是数组:', data);
    }
  } catch (error) {
    console.error('获取数据或保存失败:', error);
  }
}

// 调用函数执行任务
fetchDataAndSave();
