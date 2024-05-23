import { createI18n } from 'vue-i18n'
// import useAppStore from '@/store/modules/app'
import { listLangByLocale } from '@/api/system/commonlang.js'
import defaultSettings from '@/settings'
import cache from '@/plugins/cache'
const language = computed(() => {
  // return useAppStore().lang
  return cache.local.get('lang') || defaultSettings.defaultLang
})

import zhCn from './lang/zh-cn.json'
import en from './lang/en.json'
import zhTw from './lang/zh-tw.json'

import pageLoginCn from './pages/login/zh-cn.json'
import pageLoginEn from './pages/login/en.json'
import pageLoginTw from './pages/login/zh-tw.json'

// 菜单页面
import pagemenuCn from './pages/menu/zh-cn.json'
import pagemenuEn from './pages/menu/en.json'
import pagemenuTw from './pages/menu/zh-tw.json'

const i18n = createI18n({
  // 全局注入 $t 函数
  globalInjection: true,
  fallbackLocale: 'zh-cn',
  locale: language.value, //默认选择的语言
  legacy: false, // 使用 Composition API 模式，则需要将其设置为false
  messages: {
    'zh-cn': {
      ...zhCn,
      ...pageLoginCn,
      ...pagemenuCn
    },
    'zh-tw': {
      ...zhTw,
      ...pageLoginTw,
      ...pagemenuTw
    },
    en: {
      ...en,
      ...pageLoginEn,
      ...pagemenuEn
    }
    //... 在这里添加其他语言支持
  }
})

const loadLocale = () => {
  listLangByLocale(language.value).then((res) => {
    const { code, data } = res
    if (code == 200) {
      i18n.global.mergeLocaleMessage(language.value, data)
    }
  })
}
loadLocale()
export default i18n
