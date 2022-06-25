import { login, logout, getInfo, oauthCallback } from '@/api/system/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'
import Cookies from 'js-cookie'
import { encrypt } from '@/utils/jsencrypt'
const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: '',
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    userId: 0,
    authSource: ''
  }),
  actions: {
    setAuthSource(source) {
      this.authSource = source
    },
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid)
          .then((res) => {
            if (res.code == 200) {
              setToken(res.data)
              this.token = res.data
              resolve() //then处理
            } else {
              console.log('login error ', res)
              reject(res) //catch处理
            }
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    /**
     * 三方授权登录
     * @param {*} data
     * @param {*} param { authSource : ''}
     * @returns
     */
    oauthLogin(data, param) {
      return new Promise((resolve, reject) => {
        oauthCallback(data, param).then((res) => {
          const { code, data } = res
          if (code == 200) {
            setToken(data.token)
            this.token = data.token
            Cookies.set('username', data.userName, { expires: 30 })
            Cookies.set('password', encrypt(data.password), { expires: 30 })
            Cookies.set('rememberMe', true, { expires: 30 })
            resolve(res) //then处理
          } else {
            console.log('login error ', res)
            reject(res) //catch处理
          }
        })
      })
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const data = res.data
            const avatar = data.user.avatar == '' ? defAva : data.user.avatar

            if (data.roles && data.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = data.roles
              this.permissions = data.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }

            this.name = data.user.nickName
            this.avatar = avatar
            this.userInfo = data.user //新加
            this.userId = data.user.userId //新加
            resolve(res)
          })
          .catch((error) => {
            console.error(error)
            reject('获取用户信息失败')
          })
      })
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then((res) => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 前端 登出
    fedLogOut() {
      return new Promise((resolve) => {
        this.token = ''
        removeToken()
        resolve()
      })
    }
  }
})
export default useUserStore
