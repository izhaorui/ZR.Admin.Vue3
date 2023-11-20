import request from '@/utils/request'

/**
* 邮件发送记录分页查询
* @param {查询条件} data
*/
export function listEmailLog(query) {
  return request({
    url: 'system/EmailLog/list',
    method: 'get',
    params: query,
  })
}

/**
* 新增邮件发送记录
* @param data
*/
export function sendEmail(data) {
  return request({
    url: 'system/EmailLog/sendEmail',
    method: 'post',
    data: data,
  })
}
/**
* 获取邮件发送记录详情
* @param {Id}
*/
export function getEmailLog(id) {
  return request({
    url: 'system/EmailLog/' + id,
    method: 'get'
  })
}

/**
* 删除邮件发送记录
* @param {主键} pid
*/
export function delEmailLog(pid) {
  return request({
    url: 'system/EmailLog/' + pid,
    method: 'delete'
  })
}
