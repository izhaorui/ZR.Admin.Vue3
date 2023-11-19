import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
 * 短信验证码记录分页查询
 * @param {查询条件} data
 */
export function listSmscodeLog(query) {
  return request({
    url: 'system/SmscodeLog/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取短信验证码记录详情
 * @param {Id}
 */
export function getSmscodeLog(id) {
  return request({
    url: 'system/SmscodeLog/' + id,
    method: 'get'
  })
}

/**
 * 删除短信验证码记录
 * @param {主键} pid
 */
export function delSmscodeLog(pid) {
  return request({
    url: 'system/SmscodeLog/' + pid,
    method: 'delete'
  })
}
// 导出短信验证码记录
export async function exportSmscodeLog(query) {
  await downFile('system/SmscodeLog/export', { ...query })
}
