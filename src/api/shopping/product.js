import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
 * 商品管理分页查询
 * @param {查询条件} data
 */
export function listShoppingProduct(query) {
  return request({
    url: 'shopping/product/list',
    method: 'get',
    params: query
  })
}

/**
 * 新增商品管理
 * @param data
 */
export function addShoppingProduct(data) {
  return request({
    url: 'shopping/product',
    method: 'post',
    data: data
  })
}
/**
 * 修改商品管理
 * @param data
 */
export function updateShoppingProduct(data) {
  return request({
    url: 'shopping/product',
    method: 'PUT',
    data: data
  })
}

/**
 * 修改商屏信息
 * @param {*} data
 * @returns
 */
export function updateInfo(data) {
  return request({
    url: 'shopping/product/edit',
    method: 'PUT',
    data: data
  })
}

/**
 * 获取商品管理详情
 * @param {Id}
 */
export function getShoppingProduct(id) {
  return request({
    url: 'shopping/product/' + id,
    method: 'get'
  })
}

/**
 * 删除商品管理
 * @param {主键} pid
 */
export function delShoppingProduct(pid) {
  return request({
    url: 'shopping/product/delete/' + pid,
    method: 'POST'
  })
}
// 导出商品管理
export async function exportShoppingProduct(query) {
  await downFile('shopping/product/export', { ...query })
}

/**
 * 保存排序
 * @param {*} data
 * @returns
 */
export function changeSort(data) {
  return request({
    url: 'shopping/product/ChangeSort',
    method: 'get',
    params: data
  })
}

/**
 * 下单表单配置元数据（预设字段 + 字段类型 + 长度/数量限制）
 *
 * 预设与限制都取自服务端常量，前端不另维护一份「类型 → 中文名/默认长度」的映射表；
 * 纯常量接口、不查库，随商品编辑页打开时取一次即可。
 */
export function getProductFormMeta() {
  return request({
    url: 'shopping/product/formMeta',
    method: 'get'
  })
}

/**
 * 上架/下架商品
 * @param {商品id字符串} ids
 * @param { 操作类型 up/down} type
 */
export function operateShoppingProduct(ids, type) {
  return request({
    url: `shopping/product/multi/${type}/${ids}`,
    method: 'POST'
  })
}
