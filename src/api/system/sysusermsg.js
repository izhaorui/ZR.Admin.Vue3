import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
 * 用户系统消息分页查询
 * @param {查询条件} data
 */
export function listSysUserMsg(query) {
  return request({
    url: 'SysUserMsg/list',
    method: 'get',
    params: query
  })
}

/**
 * 用户系统消息分页查询
 * @param {查询条件} data
 */
export function listMySysUserMsg(query) {
  return request({
    url: 'SysUserMsg/mylist',
    method: 'get',
    params: query
  })
}

/**
 * 新增用户系统消息
 * @param data
 */
export function addSysUserMsg(data) {
  return request({
    url: 'SysUserMsg',
    method: 'post',
    data: data
  })
}
/**
 * 获取用户系统消息详情
 * @param {Id}
 */
export function getSysUserMsg(id) {
  return request({
    url: 'SysUserMsg/' + id,
    method: 'get'
  })
}

/**
 * 删除用户系统消息
 * @param {主键} pid
 */
export function delSysUserMsg(pid) {
  return request({
    url: 'SysUserMsg/delete/' + pid,
    method: 'delete'
  })
}
// 清空用户系统消息
export function clearSysUserMsg() {
  return request({
    url: 'SysUserMsg/clean',
    method: 'delete'
  })
}
// 导出用户系统消息
export async function exportSysUserMsg(query) {
  await downFile('SysUserMsg/export', { ...query })
}

/**
 * 已读用户系统消息
 * @param data
 */
export function readSysUserMsg(msgId, msgType) {
  return request({
    url: 'SysUserMsg/read/' + msgId + '/' + msgType,
    method: 'post',
    params: { msgType }
  })
}
