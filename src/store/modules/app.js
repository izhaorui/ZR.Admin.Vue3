import Cookies from 'js-cookie'

// const state = {
//   sidebar: {
//     opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
//     withoutAnimation: false,
//     hide: false
//   },
//   device: 'desktop',
//   size: Cookies.get('size') || 'small',
//   lang: Cookies.get('lang') || 'zh-cn'
// }

// const mutations = {
//   TOGGLE_SIDEBAR: state => {
//     if (state.sidebar.hide) {
//       return false;
//     }
//     state.sidebar.opened = !state.sidebar.opened
//     state.sidebar.withoutAnimation = true

//     if (state.sidebar.opened) {
//       Cookies.set('sidebarStatus', 1)
//     } else {
//       Cookies.set('sidebarStatus', 0)
//     }
//   },
//   CLOSE_SIDEBAR: (state, withoutAnimation) => {
//     Cookies.set('sidebarStatus', 0)
//     state.sidebar.opened = false
//     state.sidebar.withoutAnimation = withoutAnimation
//   },
//   TOGGLE_DEVICE: (state, device) => {
//     state.device = device
//   },
//   SET_SIZE: (state, size) => {
//     state.size = size
//     Cookies.set('size', size)
//   },
//   SET_SIDEBAR_HIDE: (state, status) => {
//     state.sidebar.hide = status
//   },
//   SET_LANG: (state, lang) => {
//     state.lang = lang
//     Cookies.set('lang', lang)
//   },
// }

// const actions = {
//   toggleSideBar({ commit }) {
//     commit('TOGGLE_SIDEBAR')
//   },
//   closeSideBar({ commit }) {
//     commit('CLOSE_SIDEBAR', '')
//   },
//   toggleDevice({ commit }, device) {
//     commit('TOGGLE_DEVICE', device)
//   },
//   setSize({ commit }, size) {
//     commit('SET_SIZE', size)
//   },
//   toggleSideBarHide({ commit }, status) {
//     commit('SET_SIDEBAR_HIDE', status)
//   },
//   setLang({ commit }, lang) {
//     commit('SET_LANG', lang)
//   },
// }

// export default {
//   namespaced: true,
//   state,
//   mutations,
//   actions
// }
const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
      withoutAnimation: false,
      hide: false
    },
    device: 'desktop',
    size: Cookies.get('size') || 'small',
    lang: Cookies.get('lang') || 'zh-cn'
  }),
  actions: {
    toggleSideBar(withoutAnimation) {
      if (this.sidebar.hide) {
        return false
      }
      this.sidebar.opened = !this.sidebar.opened
      this.sidebar.withoutAnimation = withoutAnimation
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
    },
    closeSideBar(withoutAnimation) {
      Cookies.set('sidebarStatus', 0)
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device) {
      this.device = device
    },
    setSize(size) {
      this.size = size;
      Cookies.set('size', size)
    },
    toggleSideBarHide(status) {
      this.sidebar.hide = status
    },
    setLang(lang) {
      this.lang = lang
      Cookies.set('lang', lang)
    }
  }
})

export default useAppStore