const state = {
  onlineNum: 0,
  onlineUsers: [],
  noticeList: []
}
const mutations = {
  SET_ONLINEUSER_NUM: (state, num) => {
    state.onlineNum = num
  },
  SET_NOTICE_list: (state, data) => {
    state.noticeList = data;
  },
  SET_ONLINE_USERS: (state, data) => {
    state.onlineUsers = data;
  }
}

const actions = {
  //更新在线人数
  changeOnlineNum({ commit }, data) {
    commit('SET_ONLINEUSER_NUM', data)
  },
  // 更新系统通知
  getNoticeList({ commit }, data) {
    commit('SET_NOTICE_list', data)
  },
  getOnlineUsers({ commit }, data) {
    commit('SET_ONLINE_USERS', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}