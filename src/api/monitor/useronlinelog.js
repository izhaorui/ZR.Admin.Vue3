import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
* 用户在线时长分页查询
* @param {查询条件} data
*/
export function listUserOnlineLog(query) {
  return request({
    url: 'monitor/UserOnlineLog/list',
    method: 'get',
    params: query,
  })
}

/**
* 新增用户在线时长
* @param data
*/
export function addUserOnlineLog(data) {
  return request({
    url: 'monitor/UserOnlineLog',
    method: 'post',
    data: data,
  })
}
/**
* 获取用户在线时长详情
* @param {Id}
*/
export function getUserOnlineLog(id) {
  return request({
    url: 'monitor/UserOnlineLog/' + id,
    method: 'get'
  })
}

/**
* 删除用户在线时长
* @param {主键} pid
*/
export function delUserOnlineLog(pid) {
  return request({
    url: 'monitor/UserOnlineLog/delete/' + pid,
    method: 'delete'
  })
}
// 导出用户在线时长
export async function exportUserOnlineLog(query) {
  await downFile('monitor/UserOnlineLog/export', { ...query })
}
