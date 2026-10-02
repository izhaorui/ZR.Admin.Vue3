import request from '@/utils/request'

export function getAreaTree(parentId) {
  return request({
    url: 'shopping/area/tree',
    method: 'get',
    params: { parentId }
  })
}
