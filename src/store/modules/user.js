import { login, logout, getInfo, oauthCallback, phoneLogin } from '@/api/system/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import useTagsViewStore from './tagsView'
import defAva from '@/assets/images/profile.jpg'
import cache from '@/plugins/cache'
import md5 from 'crypto-js/md5'

const useUserStore = defineStore('user', {
  persist: {
    paths: ['loginType', 'clientId'] //存储指定key
  },
  state: () => ({
    loginType: 1,
    userInfo: '',
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    userId: 0,
    authSource: '',
    userName: '',
    clientId: ''
  }),
  actions: {
    setAuthSource(source) {
      this.authSource = source
    },
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim()
      const password = md5(userInfo.password).toString()
      const code = userInfo.code
      const uuid = userInfo.uuid
      const clientId = this.clientId

      return new Promise((resolve, reject) => {
        login(username, password, code, uuid, clientId)
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
        oauthCallback(data, param)
          .then((res) => {
            const { code, data } = res
            if (code == 200) {
              setToken(data.token)
              this.token = data.token
              // Cookies.set('username', data.userName, { expires: 30 })
              // Cookies.set('password', encrypt(data.password), { expires: 30 })
              // Cookies.set('rememberMe', true, { expires: 30 })
              resolve(res) //then处理
            } else {
              console.log('login error ', res)
              reject(res) //catch处理
            }
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    // 扫码登录
    scanLogin(data) {
      return new Promise((resolve, reject) => {
        setToken(data.token)
        this.token = data.token

        resolve(data.token) //then处理
      })
    },
    // 手机号登录
    phoneNumLogin(userInfo) {
      return new Promise((resolve, reject) => {
        phoneLogin(userInfo)
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
            this.userName = data.user.userName //新加
            resolve(res)
          })
          .catch((error) => {
            console.warn(error)
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
            useTagsViewStore().visitedViews = []
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
    },
    setClientId(clientId) {
      this.clientId = clientId
    },
    refreshToken(token) {
      setToken(token)
      this.token = token
    }
  }
})
export default useUserStore
