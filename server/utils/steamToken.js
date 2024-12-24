import base64url from 'base64url'
import crypto from 'crypto'

class SteamGuard {
  constructor(sharedSecret) {
    if (!sharedSecret) {
      throw new Error('Shared Secret is required')
    }
    this.sharedSecret = sharedSecret
  }

  generateCode(timestamp) {
    const time = Math.floor(timestamp / 1000 / 30)
    const buffer = Buffer.alloc(8)
    
    // 高32位和低32位拆分写入
    const high = Math.floor(time / Math.pow(2, 32))
    const low = time % Math.pow(2, 32)
    
    buffer.writeUInt32BE(high, 0)
    buffer.writeUInt32BE(low, 4)

    const secret = base64url.toBuffer(this.sharedSecret)
    const hmac = crypto.createHmac('sha1', secret).update(buffer).digest()

    const start = hmac[19] & 0xf
    let codeInt = hmac.readUIntBE(start, 4) & 0x7fffffff

    const chars = '23456789BCDFGHJKMNPQRTVWXY'
    let code = ''
    for (let i = 0; i < 5; i++) {
      code += chars[codeInt % chars.length]
      codeInt = Math.floor(codeInt / chars.length)
    }

    return code
  }

  getSteamCode() {
    return this.generateCode(Date.now())
  }
}

export function generateSteamGuardCode(sharedSecret) {
  try {
    const steamGuard = new SteamGuard(sharedSecret)
    return steamGuard.getSteamCode()
  } catch (error) {
    console.error('Steam令牌生成失败:', error)
    return null
  }
} 