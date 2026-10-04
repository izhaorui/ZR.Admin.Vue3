import request from '@/utils/request'

// 商城 C 端**匿名浏览**接口（对接后端 shopping/front/product/*）
//
// 注意：本文件原有的"游客下单 / 游客查单 / 发验证码 / 游客取消 / 游客支付"封装
// 已随「取消游客下单」一并删除 —— C 端下单、支付、查单、取消请走会员接口
// /front/member/order/*（需请求头 mall-token，见独立商城前端 ZRAdmin-mall-vue3）。

// 商品列表（仅上架）
export function listFrontProduct(query) {
  return request({
    url: 'shopping/front/product/list',
    method: 'get',
    params: query
  })
}

// 商品详情（仅上架）
export function getFrontProduct(id) {
  return request({
    url: 'shopping/front/product/' + id,
    method: 'get'
  })
}
