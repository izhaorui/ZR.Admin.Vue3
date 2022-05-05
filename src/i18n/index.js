import { createI18n } from 'vue-i18n';
import store from '@/store/index';

import zhCn from './lang/zh-cn';
import en from './lang/en';
import zhTw from './lang/zh-tw';

import pageLoginCn from './pages/login/zh-cn'
import pageLoginEn from './pages/login/en'
import pageLoginTw from './pages/login/zh-tw'

const i18n = createI18n({
  // 全局注入 $t 函数
  globalInjection: true,
  fallbackLocale: 'zh-cn',
  locale: store.getters.language, //默认选择的语言 
  legacy: false, // 使用 Composition API 模式，则需要将其设置为false
  messages: {
    'zh-cn': { ...zhCn, ...pageLoginCn },
    'zh-tw': { ...zhTw, ...pageLoginTw },
    'en': { ...en, ...pageLoginEn }
  }
})

export default i18n;