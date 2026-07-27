import request from '@/utils/request'

/**
 * 预览主库结构差异
 */
export function diffDbSync() {
  return request({
    url: 'system/dbSync/diff',
    method: 'get'
  })
}

/**
 * 预览商城库结构差异
 */
export function diffMallDbSync() {
  return request({
    url: 'shopping/dbSync/diff',
    method: 'get'
  })
}

/**
 * 执行主库同步：补齐缺失表/列
 */
export function syncDbSync() {
  return request({
    url: 'system/dbSync/sync',
    method: 'post'
  })
}

/**
 * 执行商城库同步：补齐缺失表/列 + 刷新种子数据（商城菜单等）
 * @param {boolean} syncSeed 是否同步种子数据（商城菜单等）
 */
export function syncMallDbSync(syncSeed = true) {
  return request({
    url: 'shopping/dbSync/sync',
    method: 'post',
    params: { syncSeed }
  })
}
