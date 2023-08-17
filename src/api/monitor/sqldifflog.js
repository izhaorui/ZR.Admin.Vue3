import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
 * 数据差异日志分页查询
 * @param {查询条件} data
 */
export function listSqlDiffLog(query) {
  return request({
    url: 'monitor/SqlDiffLog/list',
    method: 'get',
    params: query
  })
}

/**
 * 删除数据差异日志
 * @param {主键} pid
 */
export function delSqlDiffLog(pid) {
  return request({
    url: 'monitor/SqlDiffLog/' + pid,
    method: 'delete'
  })
}
// 导出数据差异日志
export async function exportSqlDiffLog(query) {
  await downFile('monitor/SqlDiffLog/export', { ...query })
}
