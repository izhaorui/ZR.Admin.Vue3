// 官方文档：https://docs.microsoft.com/zh-cn/aspnet/core/signalr/javascript-client?view=aspnetcore-6.0&viewFallbackFrom=aspnetcore-2.2&tabs=visual-studio
import * as signalR from '@microsoft/signalr'
import { getToken } from '@/utils/auth'
import { getClientId } from '@/utils/clientId'
import { ElMessage } from 'element-plus'
import analysis from '@/signalr/analysis'

// 首次连接失败后的最大重试次数
const MAX_FAIL_NUM = 4
// 重试退避：2s、4s、8s 依次递增，上限 30s
const RETRY_BASE_MS = 2000
const RETRY_MAX_MS = 30000

export default {
  // signalR对象
  SR: {},
  // 剩余重试次数
  failNum: MAX_FAIL_NUM,
  // 进行中的 start Promise，避免 onclose 与重试定时器并发重复启动
  starting: null,
  retryTimer: null,
  init(url) {
    var socketUrl = window.location.origin + url + '?clientId=' + encodeURIComponent(getClientId())
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(socketUrl, { accessTokenFactory: () => getToken() })
      // .withAutomaticReconnect() //自动重新连接
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

    connection.onreconnecting(() => {
      // 手动重连模式下该回调不会触发；若后续启用 withAutomaticReconnect，
      // 此时状态为 Reconnecting，再调 start() 只会空转，因此仅记录日志
      console.log('断线重新连接中... ')
    })
    analysis.onMessage(connection)
    // 启动
    // this.start();
  },
  /**
   * 调用 this.signalR.start().then(async () => { await this.SR.invoke("method")})
   * @returns {Promise<boolean>} 是否连接成功
   */
  async start() {
    // 已连接或正在连接时直接复用，避免重复 start 抛错
    if (this.starting) {
      return this.starting
    }
    if (this.SR.state !== signalR.HubConnectionState.Disconnected) {
      return true
    }
    this.starting = (async () => {
      try {
        //使用async和await 或 promise的then 和catch 处理来自服务端的异常
        await this.SR.start()
        // 连接成功后重置失败重试次数
        this.failNum = MAX_FAIL_NUM
        this.clearRetryTimer()
        return true
      } catch (error) {
        this.failNum--
        console.error('剩余异常次数:' + this.failNum, error)
        if (this.failNum > 0 && this.SR.state === signalR.HubConnectionState.Disconnected) {
          this.scheduleRetry()
        }
        return false
      } finally {
        this.starting = null
      }
    })()
    return this.starting
  },
  /** 按指数退避安排下一次重连，重复调用只保留最后一次 */
  scheduleRetry() {
    this.clearRetryTimer()
    const attempt = MAX_FAIL_NUM - this.failNum
    const delay = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * Math.pow(2, attempt))
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      this.start()
    }, delay)
  },
  clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
  },
  /** 主动断开（退出登录等场景），并取消待执行的重连 */
  async stop() {
    this.clearRetryTimer()
    this.failNum = MAX_FAIL_NUM
    if (this.SR.state !== signalR.HubConnectionState.Disconnected) {
      await this.SR.stop()
    }
  }
}
