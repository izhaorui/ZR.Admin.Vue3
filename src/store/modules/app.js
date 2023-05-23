import Cookies from 'js-cookie'
import cache from '@/plugins/cache'
import defaultSettings from '@/settings'
const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
      // withoutAnimation: false,
      hide: false
    },
    device: 'desktop',
    size: cache.local.get('size') || defaultSettings.defaultSize,
    lang: cache.local.get('lang') || defaultSettings.defaultLang
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
      cache.local.set('size', size)
    },
    toggleSideBarHide(status) {
      this.sidebar.hide = status
    },
    setLang(lang) {
      this.lang = lang
      cache.local.set('lang', lang)
    }
  }
})

export default useAppStore
