const useSocketStore = defineStore('socket', {
  state: () => ({
    onlineNum: 0,
    onlineUsers: [],
    noticeList: [],
    noticeDot: false
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
    // setOnlineUsers(data) {
    //   const { onlineNum, users } = data
    //   this.onlineUsers = users
    //   this.onlineNum = onlineNum
    // },
    sendChat(data) {
      const { proxy } = getCurrentInstance()
      console.log(data)
    }
  }
})
export default useSocketStore
