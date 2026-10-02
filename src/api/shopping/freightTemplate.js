import request from '@/utils/request'

/**
 * 运费模板（后端 FreightTemplateController，路由 shopping/freightTemplate）
 * 权限前缀 shop:freight:*，与菜单种子一一对应。
 */

/** 分页查询模板列表 */
export function listFreightTemplate(query) {
  return request({
    url: 'shopping/freightTemplate/list',
    method: 'get',
    params: query
  })
}

/** 全部模板（商品编辑页的运费模板下拉） */
export function listAllFreightTemplate() {
  return request({
    url: 'shopping/freightTemplate/all',
    method: 'get'
  })
}

/** 查询模板详情（含不配送地区） */
export function getFreightTemplate(id) {
  return request({
    url: 'shopping/freightTemplate/' + id,
    method: 'get'
  })
}

/** 新增模板 */
export function addFreightTemplate(data) {
  return request({
    url: 'shopping/freightTemplate',
    method: 'post',
    data
  })
}

/** 修改模板 */
export function updateFreightTemplate(data) {
  return request({
    url: 'shopping/freightTemplate',
    method: 'PUT',
    data
  })
}

/**
 * 删除模板
 * @param {string|number|Array} ids 逗号分隔的 Id 串（与其它商城模块一致）
 */
export function delFreightTemplate(ids) {
  return request({
    url: 'shopping/freightTemplate/delete/' + ids,
    method: 'post'
  })
}
