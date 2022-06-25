import defaultSettings from '@/settings'
import { useDynamicTitle } from '@/utils/dynamicTitle'

const { sideTheme, theme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle, showFooter, showWatermark, watermarkText } =
  defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''
const useSettingsStore = defineStore('settings', {
  state: () => ({
    title: '',
    theme: storageSetting.theme || theme,
    sideTheme: storageSetting.sideTheme || sideTheme,
    showSettings: showSettings,
    topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
    tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
    fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
    sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
    dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
    showFooter: storageSetting.showFooter === undefined ? showFooter : storageSetting.showFooter,
    showWatermark: storageSetting.showWatermark === undefined ? showWatermark : storageSetting.showWatermark,
    watermarkText: storageSetting.watermarkText === undefined ? watermarkText : storageSetting.watermarkText
  }),
  actions: {
    // 修改布局设置
    changeSetting(data) {
      const { key, value } = data
      if (this.hasOwnProperty(key)) {
        this[key] = value
      }
    },
    // 设置网页标题
    setTitle(title) {
      this.title = title
      useDynamicTitle()
    }
  }
})
export default useSettingsStore
