import devConfig from './dev.js'
import prodConfig from './prod.js'

const env = process.env.NODE_ENV || 'development'
const configs = {
  development: devConfig,
  production: prodConfig
}

export default configs[env] 