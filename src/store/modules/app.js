import Cookies from 'js-cookie'
import defaultSettings from '@/settings'
const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
      // withoutAnimation: false,
      hide: false
    },
    device: 'desktop',
    size: Cookies.get('size') || defaultSettings.defaultSize,
    lang: Cookies.get('lang') || 'zh-cn'
  }),
  actions: {
    toggleSideBar() {
      if (this.sidebar.hide) {
        return false
      }
      this.sidebar.opened = !this.sidebar.opened
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
    },
    closeSideBar() {
      Cookies.set('sidebarStatus', 0)
      this.sidebar.opened = false
    },
    toggleDevice(device) {
      this.device = device
    },
    setSize(size) {
      this.size = size
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
