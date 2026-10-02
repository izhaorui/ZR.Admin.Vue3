import request from '@/utils/request'

/**
 * 售后单分页查询（按售后单号/订单号/类型/状态/申请时间）
 * @param {查询条件} query
 */
export function listAfterSale(query) {
  return request({
    url: 'shopping/afterSale/list',
    method: 'get',
    params: query
  })
}

/**
 * 售后单详情
 * 额外带回原订单的实付/已退金额与商品摘要 —— 登记退款时据此判断可退上限
 */
export function getAfterSale(id) {
  return request({
    url: 'shopping/afterSale/' + id,
    method: 'get'
  })
}

/**
 * 审核（通过 / 驳回）
 * 驳回必须填 auditRemark；审核不改金额，最终退款额在登记退款时填
 * @param {id, approved, auditRemark} data
 */
export function auditAfterSale(data) {
  return request({
    url: 'shopping/afterSale/audit',
    method: 'put',
    data: data
  })
}

/**
 * 确认收到退货（待商家收货 → 待退款）
 * @param {售后单Id} id
 * @param {收货备注，如"少件""影响二次销售"} remark
 */
export function receiveAfterSale(id, remark) {
  return request({
    url: 'shopping/afterSale/receive/' + id,
    method: 'put',
    params: { remark: remark }
  })
}

/**
 * 登记渠道退款并完成售后（待退款 → 已完成）
 * 约定：调用前渠道退款已由人工在支付渠道完成，这里只做登记与订单落账
 * @param {id, refundAmount, refundChannelNo} data
 */
export function refundAfterSale(data) {
  return request({
    url: 'shopping/afterSale/refund',
    method: 'put',
    data: data
  })
}

/**
 * 代客撤销售后（后台发起，不做会员归属校验）
 * @param {售后单Id} id
 */
export function cancelAfterSale(id) {
  return request({
    url: 'shopping/afterSale/cancel/' + id,
    method: 'put'
  })
}
