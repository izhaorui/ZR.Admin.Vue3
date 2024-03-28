import defaultSettings from '@/settings'
import { useDynamicTitle } from '@/utils/dynamicTitle'

const {
  sideTheme,
  theme,
  showSettings,
  topNav,
  tagsView,
  fixedHeader,
  sidebarLogo,
  dynamicTitle,
  showFooter,
  showWatermark,
  watermarkText,
  tagsViewPersist,
  codeMode,
  tagsShowIcon,
  navType
} = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''
const useSettingsStore = defineStore('layout-setting', {
  persist: {
    paths: [
      'theme',
      'sideTheme',
      'topNav',
      'tagsView',
      'fixedHeader',
      'sidebarLogo',
      'dynamicTitle',
      'showFooter',
      'showWatermark',
      'tagsViewPersist',
      'codeMode',
      'tagsShowIcon',
      'navType'
    ] //存储指定key
  },
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
    watermarkText: storageSetting.watermarkText === undefined ? watermarkText : storageSetting.watermarkText,
    tagsViewPersist: storageSetting.tagsViewPersist === undefined ? tagsViewPersist : storageSetting.tagsViewPersist,
    codeMode: storageSetting.codeMode === undefined ? codeMode : storageSetting.codeMode,
    tagsShowIcon: storageSetting.tagsShowIcon === undefined ? tagsShowIcon : storageSetting.tagsShowIcon,
    navType: storageSetting.navType === undefined ? navType : storageSetting.navType
  }),
  actions: {
    // 修改布局设置
    changeSetting(data) {
      const { key, value } = data
      if (Object.prototype.hasOwnProperty.call(this.$state, key)) {
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
