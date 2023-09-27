import useUserStore from './user'
import signalR from '@/signalr/signalr'
const useSocketStore = defineStore('socket', {
  persist: {
    paths: ['chatMessage', 'chatList', 'sessionList'] //存储指定key
  },
  state: () => ({
    onlineNum: 0,
    onlineUsers: [],
    noticeList: [],
    noticeDot: false,
    //在线用户信息
    onlineInfo: {},
    // 聊天数据
    chatList: {},
    leaveUser: {},
    sessionList: {},
    newChat: 0
  }),
  getters: {
    /**
     * 返回当前会话的消息
     * @param {*} state
     * @returns
     */
    getMessageList(state) {
      return (conversationId) => state.chatList[conversationId]
    },
    getSessionList(state) {
      return (userid) => state.sessionList[userid] || []
    }
  },
  actions: {
    //更新在线人数
    setOnlineUserNum(num) {
      this.onlineNum = num
    },
    // 更新系统通知
    setNoticeList(data) {
      this.noticeList = data
      this.noticeDot = data.length > 0
    },
    setOnlineUsers(data) {
      const { onlineClients, num, leaveUser } = data
      this.onlineUsers = onlineClients
      this.onlineNum = num
      if (leaveUser != null) {
        this.leaveUser = leaveUser
      }
    },
    getOnlineInfo(data) {
      this.onlineInfo = data
    },
    setChat(data) {
      const userStore = useUserStore()
      var selfUserId = userStore.userId

      var sessionId = data.toUserId
      if (data.userId != selfUserId) {
        sessionId = data.userId
      }
      var obj = this.chatList[sessionId]
      if (obj && obj.length >= 50) {
        this.chatList[sessionId].shift()
      }
      if (obj == null || obj == undefined) {
        this.chatList[sessionId] = []
      }
      // 判断消息是否是自己发的
      data.self = data.userId == selfUserId
      this.chatList[sessionId].push(data)
      if (selfUserId == data.userId) return

      if (this.sessionList[selfUserId] == undefined) {
        this.sessionList[selfUserId] = []
      }
      var index = this.getSessionList(selfUserId).findIndex((x) => x.userId == data.userId)
      this.getSessionList(selfUserId).splice(index, 1)
      this.getSessionList(selfUserId).push(data)
    },
    sendChat(data) {
      // console.log(JSON.stringify(data))
      return new Promise((resolve, reject) => {
        signalR.SR.invoke('sendMessage', data.toUserId, data.message)
          .then(() => {
            resolve(true)
          })
          .catch((err) => {
            reject(false)
            console.error(err.toString())
          })
      })
    }
  }
})
export default useSocketStore
