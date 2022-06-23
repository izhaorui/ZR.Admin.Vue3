import request from '@/utils/request'

/**
* 三方账号绑定分页查询
* @param {查询条件} data
*/
export function listThirdAccount(query) {
  return request({
    url: 'system/ThirdAccount/list',
    method: 'get',
    params: query,
  })
}


/**
* 新增三方账号绑定
* @param data
*/
export function addThirdAccount(data) {
  return request({
    url: 'system/ThirdAccount',
    method: 'post',
    data: data,
  })
}

/**
* 修改三方账号绑定
* @param data
*/
export function updateThirdAccount(data) {
  return request({
    url: 'system/ThirdAccount',
    method: 'PUT',
    data: data,
  })
}

/**
* 获取三方账号绑定详情
* @param {Id}
*/
export function getThirdAccount(id) {
  return request({
    url: 'system/ThirdAccount/' + id,
    method: 'get'
  })
}

/**
* 删除三方账号绑定
* @param {主键} pid
*/
export function delThirdAccount(pid) {
  return request({
    url: 'system/ThirdAccount/' + pid,
    method: 'delete'
  })
}

// 导出三方账号绑定
export function exportThirdAccount(query) {
  return request({
    url: 'system/ThirdAccount/export',
    method: 'get',
    params: query
  })
}

