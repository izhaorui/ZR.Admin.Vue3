import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
 * 用户系统消息分页查询
 * @param {查询条件} data
 */
export function listSysUserMsg(query) {
  return request({
    url: 'sysUserMsg/list',
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
    url: 'sysUserMsg/mylist',
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
    url: 'sysUserMsg',
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
    url: 'sysUserMsg/' + id,
    method: 'get'
  })
}

/**
 * 删除用户系统消息
 * @param {主键} pid
 */
export function delSysUserMsg(pid) {
  return request({
    url: 'sysUserMsg/delete/' + pid,
    method: 'delete'
  })
}
// 清空用户系统消息
export function clearSysUserMsg() {
  return request({
    url: 'sysUserMsg/clean',
    method: 'delete'
  })
}
// 导出用户系统消息
export async function exportSysUserMsg(query) {
  await downFile('sysUserMsg/export', { ...query })
}

/**
 * 已读用户系统消息
 * @param data
 */
export function readSysUserMsg(msgId, msgType) {
  return request({
    url: 'sysUserMsg/read/' + msgId + '/' + msgType,
    method: 'post',
    params: { msgType }
  })
}

/**
 * 当前用户全部消息标记为已读
 */
export function readAllSysUserMsg() {
  return request({
    url: 'sysUserMsg/readAll',
    method: 'post'
  })
}

/**
 * 获取当前用户未读消息总数
 */
export function unreadCount() {
  return request({
    url: 'sysUserMsg/myMsgNum',
    method: 'get'
  }).then((res) => {
    const groups = res.data?.data || []
    return { data: groups.reduce((sum, g) => sum + (g.num || 0), 0) }
  })
}
