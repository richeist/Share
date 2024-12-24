
import base64url from 'base64url';
import crypto from 'crypto';
import axios from 'axios';

class SteamGuard {
  constructor(sharedSecret) {
    if (!sharedSecret) {
      throw new Error('Shared Secret is required to initialize SteamGuard.');
    }
    this.sharedSecret = sharedSecret;
  }

  /**
   * 获取与 Steam 时间同步的时间戳
   * @returns {Promise<number>} - 当前时间戳（毫秒）
   */
  async getSteamTime() {
    try {
const response = await axios.post('https://api.steampowered.com/ITwoFactorService/QueryTime/v0001/', {});
      const steamTime = response.data.response.server_time;
      return steamTime * 1000; // 转换为毫秒
    } catch (error) {
      console.error('Failed to fetch Steam time:', error);
      return Date.now(); // 返回本地时间作为备用
    }
  }

  /**
   * 生成 Steam 验证码
   * @param {number} timestamp - 时间戳（毫秒）
   * @returns {string} - 生成的验证码
   */
  generateCode(timestamp) {
    const time = Math.floor(timestamp / 1000 / 30); // 每 30 秒周期
    const buffer = Buffer.alloc(8);
    // buffer.writeUIntBE(time, 0, 8);
// 高32位和低32位拆分写入
const high = Math.floor(time / Math.pow(2, 32)); // 高32位
const low = time % Math.pow(2, 32); // 低32位

buffer.writeUInt32BE(high, 0); // 写入高32位
buffer.writeUInt32BE(low, 4); // 写入低32位

    const secret = base64url.toBuffer(this.sharedSecret);
    const hmac = crypto.createHmac('sha1', secret).update(buffer).digest();

    const start = hmac[19] & 0xf;
    let codeInt = hmac.readUIntBE(start, 4) & 0x7fffffff;

    const chars = '23456789BCDFGHJKMNPQRTVWXY';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[codeInt % chars.length];
      codeInt = Math.floor(codeInt / chars.length);
  
    }

    return code;
  }

  /**
   * 获取 Steam 验证码
   * @returns {Promise<string>} - 生成的验证码
   */
  async getSteamCode() {
    const timestamp = await this.getSteamTime();
    return this.generateCode(timestamp);
  }
}

// 测试代码
(async () => {
  const sharedSecret = 'SyWy0tLE99z97W9/2r+R1ClsU+o='; // 替换为实际 Shared Secret
  const steamGuard = new SteamGuard(sharedSecret);

  try {
    const code = await steamGuard.getSteamCode();
    console.log('Generated Steam Code:', code);
  } catch (error) {
    console.error('Failed to generate Steam Code:', error);
  }
})();
