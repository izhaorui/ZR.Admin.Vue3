import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
 * 话题分页查询
 * @param {查询条件} data
 */
export function listArticleTopic(query) {
  return request({
    url: 'article/ArticleTopic/list',
    method: 'get',
    params: query
  })
}

/**
 * 新增话题
 * @param data
 */
export function addArticleTopic(data) {
  return request({
    url: 'article/ArticleTopic',
    method: 'post',
    data: data
  })
}
/**
 * 修改话题
 * @param data
 */
export function updateArticleTopic(data) {
  return request({
    url: 'article/ArticleTopic',
    method: 'PUT',
    data: data
  })
}
/**
 * 获取话题详情
 * @param {Id}
 */
export function getArticleTopic(id) {
  return request({
    url: 'article/ArticleTopic/' + id,
    method: 'get'
  })
}

/**
 * 删除话题
 * @param {主键} pid
 */
export function delArticleTopic(pid) {
  return request({
    url: 'article/ArticleTopic/delete/' + pid,
    method: 'delete'
  })
}
// 导出话题
export async function exportArticleTopic(query) {
  await downFile('article/ArticleTopic/export', { ...query })
}
