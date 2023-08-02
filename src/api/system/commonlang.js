import request from '@/utils/request'

/**
 * 多语言配置分页查询
 * @param {查询条件} data
 */
export function listCommonLang(query) {
  return request({
    url: 'system/CommonLang/list',
    method: 'get',
    params: query
  })
}
/**
 * 多语言配置查询
 * @param {查询条件} data
 */
export function listLangByLocale(locale) {
  return request({
    url: 'system/CommonLang/list/' + locale,
    method: 'get'
  })
}

/**
 * 新增多语言配置
 * @param data
 */
export function addCommonLang(data) {
  return request({
    url: 'system/CommonLang',
    method: 'post',
    data: data
  })
}

/**
 * 修改多语言配置
 * @param data
 */
export function updateCommonLang(data) {
  return request({
    url: 'system/CommonLang',
    method: 'PUT',
    data: data
  })
}

/**
 * 获取多语言配置详情
 * @param {Id}
 */
export function getCommonLang(id) {
  return request({
    url: 'system/CommonLang/' + id,
    method: 'get'
  })
}
/**
 * 获取多语言配置详情
 * @param {key}
 */
export function getCommonLangByKey(key) {
  return request({
    url: 'system/CommonLang/key/' + key,
    method: 'get'
  })
}

/**
 * 删除多语言配置
 * @param {主键} pid
 */
export function delCommonLang(pid) {
  return request({
    url: 'system/CommonLang/' + pid,
    method: 'delete'
  })
}

/**
 * 删除多语言配置
 * @param {key} langkey
 */
export function delCommonLangByKey(langkey) {
  return request({
    url: 'system/CommonLang/ByKey',
    method: 'delete',
    params: { langkey }
  })
}

// 导出多语言配置
export function exportCommonLang(query) {
  return request({
    url: 'system/CommonLang/export',
    method: 'get',
    params: query
  })
}
