// 官方文档：https://docs.microsoft.com/zh-cn/aspnet/core/signalr/javascript-client?view=aspnetcore-6.0&viewFallbackFrom=aspnetcore-2.2&tabs=visual-studio
import * as signalR from '@microsoft/signalr'
import { getToken } from '@/utils/auth'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
import { webNotify } from './index'
export default {
  // signalR对象
  SR: {},
  // 失败连接重试次数
  failNum: 4,
  init(url) {
    var socketUrl = window.location.origin + url
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(socketUrl, { accessTokenFactory: () => getToken() })
      .withAutomaticReconnect() //自动重新连接
      .configureLogging(signalR.LogLevel.Warning)
      .build()
    this.SR = connection
    // 断线重连
    connection.onclose(async (error) => {
      console.error('断开连接了' + error)
      console.assert(connection.state === signalR.HubConnectionState.Disconnected)
      // 建议用户重新刷新浏览器
      await this.start()
    })

    connection.onreconnected((connectionId) => {
      ElMessage({
        message: '与服务器通讯已连接成功',
        type: 'success',
        duration: 2000
      })
      console.log('断线重新连接成功' + connectionId)
    })

    connection.onreconnecting(async () => {
      console.log('断线重新连接中... ')

      await this.start()
    })

    this.receiveMsg(connection)
    // 启动
    // this.start();
  },
  /**
   * 调用 this.signalR.start().then(async () => { await this.SR.invoke("method")})
   * @returns
   */
  async start() {
    try {
      console.log('signalR-1', this.SR.state)
      //使用async和await 或 promise的then 和catch 处理来自服务端的异常
      if (this.SR.state === signalR.HubConnectionState.Disconnected) {
        await this.SR.start()
      }

      console.log('signalR-2', this.SR.state)
      return true
    } catch (error) {
      console.error(error)
      this.failNum--
      // console.log(`失败重试剩余次数${that.failNum}`, error)
      if (this.failNum > 0 && this.SR.state.Disconnected) {
        setTimeout(async () => {
          await this.start()
        }, 5000)
      }
      return false
    }
  },
  // 接收消息处理
  receiveMsg(connection) {
    connection.on('onlineNum', (data) => {
      useSocketStore().setOnlineUsers(data)
    })
    // 接收欢迎语
    connection.on('welcome', (data) => {
      ElNotification.info(data)
    })
    connection.on('connId', (data) => {
      // useUserStore().saveConnId(data)
    })
    // 接收后台手动推送消息
    connection.on('receiveNotice', (title, data) => {
      ElNotification({
        type: 'info',
        title: title,
        message: data,
        dangerouslyUseHTMLString: true,
        duration: 0
      })
      webNotify({ title: title, body: data })
    })
    // 接收系统通知/公告
    connection.on('moreNotice', (data) => {
      if (data.code == 200) {
        useSocketStore().setNoticeList(data.data)
      }
    })

    // 接收在线用户
    // connection.on('onlineUser', (data) => {
    //   useSocketStore().setOnlineUsers(data)
    // })

    // 接收封锁通知
    connection.on('lockUser', (data) => {
      ElMessageBox.alert(`你的账号已被锁定，剩余，${data.time}分，原因：${data.reason || '-'}`, '提示', {
        confirmButtonText: '确定',
        callback: (action) => {
          useUserStore()
            .logOut()
            .then(() => {
              var redirectUrl = window.location.pathname
              if (location.pathname.indexOf('/login') != 0) {
                location.href = import.meta.env.VITE_APP_ROUTER_PREFIX + 'index?redirect=' + redirectUrl
              }
            })
        }
      })
    })
    // 接收聊天数据
    connection.on('receiveChat', (data) => {
      const title = `来自${data.userName}的消息通知`
      useSocketStore().setChat(data)

      if (data.userid != useUserStore().userId) {
        ElNotification({
          title: title,
          message: data.message,
          type: 'success',
          duration: 3000
        })
      }
      webNotify({ title: title, body: data.message })
    })

    connection.on('onlineInfo', (data) => {
      console.log('onlineInfo', data)
      useSocketStore().getOnlineInfo(data)
    })

    connection.on('logOut', () => {
      useUserStore()
        .logOut()
        .then(() => {
          ElMessageBox.alert(`你的账号已在其他设备登录，如果不是你的操作请尽快修改密码`, '提示', {
            confirmButtonText: '确定',
            callback: () => {
              location.href = import.meta.env.VITE_APP_ROUTER_PREFIX + 'index'
            }
          })
        })
    })
  }
}
