import { createI18n } from 'vue-i18n';
import store from '@/store/index';
import { listLangByLocale } from '@/api/system/commonLang'
import zhCn from './lang/zh-cn';
import en from './lang/en';
import zhTw from './lang/zh-tw';

import pageLoginCn from './pages/login/zh-cn'
import pageLoginEn from './pages/login/en'
import pageLoginTw from './pages/login/zh-tw'

import pageLangSetCn from './pages/langSet/zh-cn'
import pageLangSetEn from './pages/langSet/en'
import pageLangSetTw from './pages/langSet/zh-tw'

const i18n = createI18n({
  // 全局注入 $t 函数
  globalInjection: true,
  fallbackLocale: 'zh-cn',
  locale: store.getters.language, //默认选择的语言 
  legacy: false, // 使用 Composition API 模式，则需要将其设置为false
  messages: {
    'zh-cn': { ...zhCn, ...pageLoginCn, ...pageLangSetCn },
    'zh-tw': { ...zhTw, ...pageLoginTw, ...pageLangSetTw },
    'en': { ...en, ...pageLoginEn, ...pageLangSetEn }
  }
})
console.log('lang=' + store.getters.language)

listLangByLocale(store.getters.language).then(res => {
  const { code, data } = res
  if (code == 200) {
    i18n.global.mergeLocaleMessage('zh-cn', data.cn)
    i18n.global.mergeLocaleMessage('zh-tw', data.tw)
    i18n.global.mergeLocaleMessage('en', data.en)
  }
})
export default i18n;