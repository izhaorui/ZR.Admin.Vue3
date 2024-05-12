import request from '@/utils/request'

// 查询列表
export function listArticle(query) {
  return request({
    url: '/Article/list',
    method: 'get',
    params: query
  })
}
// 查询最新列表
export function listNewArticle(query) {
  return request({
    url: '/Article/newList',
    method: 'get',
    params: query
  })
}

// 查询详细
export function getArticle(Id) {
  return request({
    url: '/Article/' + Id,
    method: 'get'
  })
}

// 新增
export function addArticle(data) {
  return request({
    url: '/Article/add',
    method: 'post',
    data: data
  })
}

// 修改
export function updateArticle(data) {
  return request({
    url: '/Article/edit',
    method: 'put',
    data: data
  })
}

// 删除文章
export function delArticle(id) {
  return request({
    url: '/Article/' + id,
    method: 'delete'
  })
}
// 查询目录
export function listArticleCategory() {
  return request({
    url: '/Article/CategoryList',
    method: 'get'
  })
}
// 查询文章目录树
export function listArticleCategoryTree() {
  return request({
    url: '/Article/CategoryTreeList',
    menubar: 'get'
  })
}

// 置顶
export function topArticle(data) {
  return request({
    url: '/Article/top',
    method: 'put',
    data: data
  })
}
// 修改是否公开
export function changeArticlePublic(data) {
  return request({
    url: '/Article/ChangePublic',
    method: 'put',
    data: data
  })
}

/**
 * 审核
 * @param type 审核类型 pass ,reject
 * @param ids id
 */
export function auditArticle(type, ids, data) {
  return request({
    url: `article/${type}/${ids}`,
    method: 'PUT',
    params: data
  })
}
