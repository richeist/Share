// Steam令牌生成器
export class SteamGuard {
  constructor(sharedSecret) {
    if (!sharedSecret) {
      throw new Error('Shared Secret is required')
    }
    this.sharedSecret = sharedSecret
  }

  async generateCode() {
    try {
      // 调用后端API生成令牌
      const response = await fetch('/api/steam/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shared_secret: this.sharedSecret
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate token')
      }

      const data = await response.json()
      return data.token
    } catch (error) {
      console.error('生成令牌失败:', error)
      return null
    }
  }

  async getSteamCode() {
    return this.generateCode()
  }
}

// 计算令牌剩余时间
export function getTokenRemainingTime() {
  return 30 - (Math.floor(Date.now() / 1000) % 30)
}
