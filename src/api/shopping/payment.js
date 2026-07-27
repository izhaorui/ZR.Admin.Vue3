import request from '@/utils/request'

/**
 * 支付流水分页查询（按订单号/渠道/状态/时间）
 * @param {查询条件} query
 */
export function listPayment(query) {
  return request({
    url: 'shopping/Payment/list',
    method: 'get',
    params: query
  })
}

// 查询支付流水详情（含预支付凭证与回调原文）
export function getPayment(id) {
  return request({
    url: 'shopping/Payment/' + id,
    method: 'get'
  })
}
