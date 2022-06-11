<template>
  <el-config-provider :locale="locale" :size="size">
    <router-view />
  </el-config-provider>
</template>
<script setup>
import useUserStore from './store/modules/user'
import useAppStore from './store/modules/app'
import { ElConfigProvider } from 'element-plus'
import zh from 'element-plus/lib/locale/lang/zh-cn' // 中文语言
import en from 'element-plus/lib/locale/lang/en' // 英文语言
import tw from 'element-plus/lib/locale/lang/zh-tw' //繁体

const { proxy } = getCurrentInstance()

const token = computed(() => {
  return useUserStore().token
})

const lang = computed(() => {
  return useAppStore().lang
})
const locale = ref(zh)
const size = ref('small')
size.value = useAppStore().size
watch(
  token,
  (val) => {
    if (val) {
      proxy.signalr.start()
    }
  },
  {
    immediate: true,
    deep: true,
  },
)
watch(
  lang,
  (val) => {
    if (val == 'zh-cn') {
      locale.value = zh
    } else if (val == 'en') {
      locale.value = en
    } else if (val == 'zh-tw') {
      locale.value = tw
    } else {
      locale.value = zh
    }
  },
  {
    immediate: true,
  },
)
</script>
