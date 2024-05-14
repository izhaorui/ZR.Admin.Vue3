import useUserStore from './user'
import signalR from '@/signalr/signalr'
const useSocketStore = defineStore('socket', {
  persist: {
    paths: ['chatMessage', 'chatList', 'sessionList', 'newChat', 'noticeIdArr', 'newNotice', 'globalErrorMsg', 'promptNoticeReadList'] //存储指定key
  },
  state: () => ({
    onlineNum: 0,
    onlineUsers: [],
    noticeList: [],
    //未读（公告）
    promptNoticeList: [],
    //弹框通知已读
    promptNoticeReadList: [],
    //在线用户信息
    onlineInfo: {},
    // 聊天数据
    chatList: {},
    // 离开用户信息
    leaveUser: {},
    // 会话列表
    sessionList: {},
    //私信未读数
    newChat: 0,
    //通知未读数
    newNotice: 0,
    //系统消息未读数
    newSysMsg: 0,
    //所有通知id
    noticeIdArr: [],
    // 全局错误提醒
    globalErrorMsg: {}
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
    },
    /**
     * 获取所有未读小红点
     * @param {*} state
     * @returns
     */
    getAllDotNum() {
      return this.newChat + this.newNotice + this.newSysMsg
    },
    /**
     * 获取所有小红点
     * @returns
     */
    getMsgNum() {
      return {
        noticeNum: this.newNotice,
        chatNum: this.newChat,
        sysMsgNum: this.newSysMsg
      }
    }
  },
  actions: {
    //更新在线人数
    setOnlineUserNum(num) {
      this.onlineNum = num
    },
    setSysMsgNum(num) {
      this.newSysMsg = num
    },
    // 更新系统通知
    setNoticeList(data) {
      this.noticeList = data
      var gonggaoNoticeList = data.filter((x) => x.popup == 1)
      const allNoticeIdArr = data.map((x) => {
        return x.noticeId
      })

      var diffArr = allNoticeIdArr.filter((v) => !this.noticeIdArr.some((item) => item == v))

      if (diffArr.length > 0) {
        this.newNotice = diffArr.length
        this.noticeIdArr = allNoticeIdArr
      }

      // 未读弹框通知
      this.promptNoticeList = gonggaoNoticeList.filter((v) => !this.promptNoticeReadList.some((item) => item == v.noticeId))
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
      this.newChat++

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
    },
    /**
     * 消息已读
     * @param {*} type
     */
    readAll(type) {
      if (type == 0) {
        this.newNotice = 0
      } else if (type == 1) {
        this.newChat = 0
      } else if (type == 2) {
        this.newSysMsg = 0
      }
    },
    readPromptNotice(id) {
      this.promptNoticeReadList.push(id)
    },
    setGlobalError(data) {
      this.globalErrorMsg = data
    },
    clear() {
      this.promptNoticeReadList = []
      this.noticeIdArr = []
      this.globalErrorMsg = {}
    }
  }
})
export default useSocketStore
