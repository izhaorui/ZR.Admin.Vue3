import request from '@/utils/request'

// 查询个人日程列表
export function listDailySchedule(query) {
  return request({
    url: '/system/dailyschedule/list',
    method: 'get',
    params: query
  })
}

// 查询统计（总/未完成/今日到期/已逾期）
export function dailyScheduleStats() {
  return request({
    url: '/system/dailyschedule/stats',
    method: 'get'
  })
}

// 查询详情
export function getDailySchedule(id) {
  return request({
    url: '/system/dailyschedule/' + id,
    method: 'get'
  })
}

// 新增日程
export function addDailySchedule(data) {
  return request({
    url: '/system/dailyschedule',
    method: 'post',
    data: data
  })
}

// 修改日程
export function updateDailySchedule(data) {
  return request({
    url: '/system/dailyschedule',
    method: 'put',
    data: data
  })
}

// 删除日程
export function delDailySchedule(ids) {
  return request({
    url: '/system/dailyschedule/' + ids,
    method: 'delete'
  })
}

// 标记完成 / 取消完成
export function changeDailyScheduleStatus(data) {
  return request({
    url: '/system/dailyschedule/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询当前用户未完成日程列表（消息中心日程 tab）
export function reminderDailySchedules() {
  return request({
    url: '/system/dailyschedule/reminders',
    method: 'get'
  })
}
