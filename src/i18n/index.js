import { createI18n } from 'vue-i18n';
import store from '@/store/index';
import { listLangByLocale } from '@/api/system/commonLang'
import zhCn from './lang/zh-cn.json';
import en from './lang/en.json';
import zhTw from './lang/zh-tw.json';

import pageLoginCn from './pages/login/zh-cn'
import pageLoginEn from './pages/login/en'
import pageLoginTw from './pages/login/zh-tw'

import pageLangSetCn from './pages/langSet/zh-cn'
import pageLangSetEn from './pages/langSet/en'
import pageLangSetTw from './pages/langSet/zh-tw'

import pagemenuCn from './pages/menu/zh-cn'
import pagemenuEn from './pages/menu/en'
import pagemenuTw from './pages/menu/zh-tw'

const i18n = createI18n({
  // 全局注入 $t 函数
  globalInjection: true,
  fallbackLocale: 'zh-cn',
  locale: store.getters.language, //默认选择的语言 
  legacy: false, // 使用 Composition API 模式，则需要将其设置为false
  messages: {
    'zh-cn': { ...zhCn, ...pageLoginCn, ...pageLangSetCn, ...pagemenuCn },
    'zh-tw': { ...zhTw, ...pageLoginTw, ...pageLangSetTw, ...pagemenuTw },
    'en': { ...en, ...pageLoginEn, ...pageLangSetEn, ...pagemenuEn }
  }
})

listLangByLocale(store.getters.language).then(res => {
  const { code, data } = res
  if (code == 200) {
    i18n.global.mergeLocaleMessage('zh-cn', data.cn)
    i18n.global.mergeLocaleMessage('zh-tw', data.tw)
    i18n.global.mergeLocaleMessage('en', data.en)
  }
})
export default i18n;