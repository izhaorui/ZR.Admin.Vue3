import request from '@/utils/request'

// 查询商品库存列表
export function listSkus(query) {
  return request({
    url: 'shopping/skus/list',
    method: 'get',
    params: query
  })
}

// 查询商品库存详情
export function getSkus(id) {
  return request({
    url: 'shopping/skus/' + id,
    method: 'get'
  })
}

// 新增商品库存
export function addSkus(data) {
  return request({
    url: 'shopping/skus',
    method: 'post',
    data: data
  })
}

// 修改商品库存
export function updateSkus(data) {
  return request({
    url: 'shopping/skus',
    method: 'put',
    data: data
  })
}

// 删除商品库存
export function delSkus(ids) {
  return request({
    url: 'shopping/skus/delete/' + ids,
    method: 'post'
  })
}
