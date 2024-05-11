import request from '@/utils/request'
import { downFile } from '@/utils/request'

/**
* 广告管理分页查询
* @param {查询条件} data
*/
export function listBannerConfig(query) {
  return request({
    url: 'public/BannerConfig/list',
    method: 'get',
    params: query,
  })
}

/**
* 新增广告管理
* @param data
*/
export function addBannerConfig(data) {
  return request({
    url: 'public/BannerConfig',
    method: 'post',
    data: data,
  })
}
/**
* 修改广告管理
* @param data
*/
export function updateBannerConfig(data) {
  return request({
    url: 'public/BannerConfig',
    method: 'PUT',
    data: data,
  })
}
/**
* 获取广告管理详情
* @param {Id}
*/
export function getBannerConfig(id) {
  return request({
    url: 'public/BannerConfig/' + id,
    method: 'get'
  })
}

/**
* 删除广告管理
* @param {主键} pid
*/
export function delBannerConfig(pid) {
  return request({
    url: 'public/BannerConfig/delete/' + pid,
    method: 'delete'
  })
}
// 导出广告管理
export async function exportBannerConfig(query) {
  await downFile('public/BannerConfig/export', { ...query })
}
export function changeSort(data) {
  return request({
    url: 'public/BannerConfig/ChangeSort',
    method: 'get',
    params: data
  })
}
