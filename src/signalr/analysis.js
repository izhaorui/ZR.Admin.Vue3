import { ElNotification, ElMessageBox } from 'element-plus'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
import { webNotify } from '@/utils/index'
import gongaoIcon from '@/assets/icons/svg/gonggao.svg'

const MsgType = {
  M001: 'onlineNum',
  M002: 'connId',
  LogOut: 'logOut'
}

export default {
  onMessage(connection) {
    const routerPrefix = import.meta.env.VITE_APP_ROUTER_PREFIX || ''

    connection.on(MsgType.M001, (data) => {
      useSocketStore().setOnlineUsers(data)
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
      webNotify({ title: title, body: '你有一条新消息', icon: gongaoIcon })
    })
    // 接收系统通知/公告
    connection.on('moreNotice', (data) => {
      if (data && data.code === 200) {
        useSocketStore().setNoticeList(data.data)
      }
    })

    // 接收在线用户
    // connection.on('onlineUser', (data) => {
    //   useSocketStore().setOnlineUsers(data)
    // })

    // 接收消息中心实时推送（系统/私信/评论/点赞等 SysUserMsg 增量消息）
    connection.on('receiveMessage', (list) => {
      if (list && list.length) {
        list.forEach((msg) => {
          ElNotification({
            title: '新消息',
            message: msg.content,
            type: 'warning',
            duration: 4000
          })
        })
      }
      // 刷新列表与未读数（取绝对值，避免刷新/重连重复累加）
      useSocketStore().refreshSysMsg()
    })

    // 接收日程提醒：仅更新未完成日程数（红点），不弹窗、不进消息列表
    connection.on('dailyScheduleReminder', (count) => {
      useSocketStore().setScheduleCount(count)
    })

    // 接收强退通知
    connection.on('forceUser', (data) => {
      useSocketStore().setGlobalError({ code: 0, msg: `你的账号已被强退，原因：${data?.reason || '无'}` })
      useUserStore()
        .logOut()
        .then(() => {
          location.href = routerPrefix + 'error'
        })
    })
    // 接收聊天数据
    connection.on('receiveChat', (data) => {
      const { fromUser, message } = data || {}

      useSocketStore().setChat(data)
      if (data && data.userId !== useUserStore().userId) {
        ElNotification({
          title: fromUser?.nickName,
          message: message,
          type: 'success',
          duration: 3000
        })
        webNotify({ title: `来自：${fromUser?.nickName || '未知用户'}`, body: message, icon: gongaoIcon })
      }
    })

    connection.on('onlineInfo', (data) => {
      useSocketStore().getOnlineInfo(data)
    })

    connection.on(MsgType.LogOut, () => {
      useUserStore()
        .logOut()
        .then(() => {
          ElMessageBox.alert(`你的账号已在其他设备登录，如果不是你的操作请尽快修改密码`, '提示', {
            confirmButtonText: '确定',
            callback: () => {
              location.href = routerPrefix + 'index'
            }
          })
        })
    })
  }
}
