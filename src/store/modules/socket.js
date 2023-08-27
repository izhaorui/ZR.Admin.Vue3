const useSocketStore = defineStore('socket', {
  state: () => ({
    onlineNum: 0,
    onlineUsers: [],
    noticeList: [],
    noticeDot: false,
    //在线用户信息
    onlineInfo: {},
    // 聊天数据
    chatList: [],
    leaveUser: {}
  }),
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
      this.chatList.push(data)
    }
  }
})
export default useSocketStore
