// 设备标识（clientId）：本地生成并持久化的随机 32 位十六进制串。
// 历史版本通过第三方 CDN 动态加载 fingerprintjs 生成浏览器指纹，等于在登录页执行远程脚本
// （无完整性校验、版本浮动、存在供应链与隐私合规风险），且清缓存/无痕下指纹同样会变。
// 这里改为本地随机值，仅用于区分浏览器：登录日志的客户端id、新设备登录提醒、SignalR 连接标识。
const ClientIdKey = 'ZR-ClientId'

// 保持与旧指纹一致的 32 位十六进制格式，避免后端对长度/字符集的既有校验失效
function randomHex32() {
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

let cached = ''

export function getClientId() {
  if (cached) return cached
  try {
    const stored = localStorage.getItem(ClientIdKey)
    if (stored) {
      cached = stored
      return cached
    }
    cached = randomHex32()
    localStorage.setItem(ClientIdKey, cached)
  } catch (e) {
    // 隐私模式下存储不可用时退化为本次会话内的内存值
    cached = randomHex32()
  }
  return cached
}
