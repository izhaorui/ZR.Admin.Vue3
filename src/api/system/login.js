import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid, clientId) {
  const data = {
    username,
    password,
    code,
    uuid,
    clientId
  }
  return request({
    url: '/login',
    method: 'POST',
    data: data,
    headers: {
      userName: username
    }
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/LogOut',
    method: 'POST'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'get'
  })
}
/**
 * 注册
 * @returns
 */
export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data: data
  })
}

/**
 * 三方授权回调
 * @param {*} data
 * @param {*} params
 * @returns
 */
export function oauthCallback(data, params) {
  return request({
    url: '/auth/callback',
    method: 'post',
    data: data,
    params: params
  })
}

/**
 * 生成二维码
 * @param {*} data
 * @returns
 */
export function generateQrcode(data) {
  return request({
    url: '/GenerateQrcode',
    method: 'GET',
    params: data
  })
}

/**
 * 刷新二维码
 * @param {*} data
 * @returns
 */
export function verifyScan(data) {
  return request({
    url: '/VerifyScan',
    method: 'post',
    data: data
  })
}

/**
 * 发送短信验证码
 * @param {*} data
 * @returns
 */
export function checkMobile(data) {
  return request({
    method: 'post',
    data: data,
    url: '/checkMobile'
  })
}

// 登录方法
export function phoneLogin(data) {
  return request({
    url: '/phoneLogin',
    method: 'POST',
    data: data
  })
}
