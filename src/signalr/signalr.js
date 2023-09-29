// 官方文档：https://docs.microsoft.com/zh-cn/aspnet/core/signalr/javascript-client?view=aspnetcore-6.0&viewFallbackFrom=aspnetcore-2.2&tabs=visual-studio
import * as signalR from '@microsoft/signalr'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import cache from '@/plugins/cache'
import analysis from '@/signalr/analysis'

export default {
  // signalR对象
  SR: {},
  // 失败连接重试次数
  failNum: 4,
  init(url) {
    var socketUrl = window.location.origin + url + '?clientId=' + cache.local.get('clientId')
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
    analysis.onMessage(connection)
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
  }
}
