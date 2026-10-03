import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
 * 订单管理分页查询
 * @param {查询条件} data
 */
export function listOMSOrder(query) {
  return request({
    url: 'shopping/Order/list',
    method: 'get',
    params: query
  })
}

/**
 * 新增订单管理
 * @param data
 */
export function addOMSOrder(data) {
  return request({
    url: 'shopping/Order',
    method: 'post',
    data: data
  })
}
/**
 * 修改订单管理
 * @param data
 */
export function updateOMSOrder(data) {
  return request({
    url: 'shopping/Order',
    method: 'PUT',
    data: data
  })
}

/**
 * 获取订单管理详情
 * @param {Id}
 */
export function getOMSOrder(id) {
  return request({
    url: 'shopping/Order/' + id,
    method: 'get'
  })
}

/**
 * 删除订单管理
 * @param {主键} pid
 */
export function delOMSOrder(pid) {
  return request({
    url: 'shopping/Order/delete/' + pid,
    method: 'POST'
  })
}
/**
 * 剔除/取消订单（回补库存），仅待付款/待发货可操作
 * @param {主键} id
 */
export function cancelOMSOrder(id) {
  return request({
    url: 'shopping/Order/cancel/' + id,
    method: 'POST'
  })
}
/**
 * 批量剔除/取消订单（回补库存），后端仅处理待付款/待发货状态的订单
 * @param {主键数组} ids
 */
export function cancelOMSOrders(ids) {
  return request({
    url: 'shopping/Order/cancel/batch',
    method: 'POST',
    data: ids
  })
}
// 导出订单管理
export async function exportOMSOrder(query) {
  await downFile('shopping/Order/export', { ...query })
}

/**
 * 查詢銷售統計
 * @param {查询条件} data
 */
export function listSales(query) {
  return request({
    url: 'shopping/Order/getSales',
    method: 'get',
    params: query
  })
}
export function listSalesTrade(query) {
  return request({
    url: 'shopping/Order/getSalesTrade',
    method: 'get',
    params: query
  })
}
/**
 * 查詢前n的商品
 * @param {} query
 * @returns
 */
export function listSaleTopProduct(query) {
  return request({
    url: 'shopping/Order/getSaleTopProduct',
    method: 'get',
    params: query
  })
}

/**
 * 订单发货
 * @param data
 */
export function deliveryOrder(data) {
  return request({
    url: 'shopping/Order/delivery',
    method: 'PUT',
    data: data
  })
}

/**
 * 订单退款
 * @param {主键} pid
 */
export function RefundOrder(data) {
  return request({
    url: 'shopping/Order/refund',
    method: 'POST',
    data: data
  })
}
// 查询订单状态变更日志（按订单Id或订单号）
export function listOrderLog(params) {
  return request({
    url: 'shopping/orderlog/list',
    method: 'get',
    params: params
  })
}

/**
 * 查看订单中敏感字段的完整值（发货用）
 *
 * 订单详情里敏感字段是脱敏的（手机号 138****8000），虚拟商品发货要的是完整值，
 * 只能从这里取 —— 后端要求 oms:order:sensitive 权限，且会把这次查看记进操作日志。
 * 只返回敏感字段，非敏感字段在详情里本就是明文。
 */
export function getOrderFormValuesRaw(id) {
  return request({
    url: 'shopping/Order/formValuesRaw/' + id,
    method: 'get'
  })
}
