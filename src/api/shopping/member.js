import request from '@/utils/request'

/**
 * 会员分页查询
 * @param {查询条件} query
 */
export function listMember(query) {
  return request({
    url: 'shopping/member/list',
    method: 'get',
    params: query
  })
}

/**
 * 会员详情
 * @param {会员Id} id
 */
export function getMember(id) {
  return request({
    url: 'shopping/member/' + id,
    method: 'get'
  })
}

/**
 * 启用/禁用会员
 * @param {memberId, status} data
 */
export function changeMemberStatus(data) {
  return request({
    url: 'shopping/member/changeStatus',
    method: 'put',
    data: data
  })
}
