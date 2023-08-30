// import signalr from './signalr'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
import { webNotify } from '@/utils/index'

export default {
  onMessage(connection) {
    connection.on(MsgType.M001, (data) => {
      useSocketStore().setOnlineUsers(data)
    })

    connection.on(MsgType.M002, (data) => {
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

    // 接收强退通知
    connection.on('forceUser', (data) => {
      ElMessageBox.alert(`你的账号已被强退，原因：${data.reason || '无'}`, '提示', {
        confirmButtonText: '确定',
        callback: () => {
          useUserStore()
            .logOut()
            .then(() => {
              location.href = import.meta.env.VITE_APP_ROUTER_PREFIX + 'index'
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
const MsgType = {
  M001: 'onlineNum',
  M002: 'connId'
}
