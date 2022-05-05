<template>
  <el-drawer v-model="showSettings" :withHeader="false" direction="rtl" size="300px">
    <div class="setting-drawer-title">
      <h3 class="drawer-title">{{ $t('layout.themeStyleSet') }}</h3>
    </div>
    <div class="setting-drawer-block-checbox">
      <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-dark')">
        <img src="@/assets/images/dark.svg" alt="dark" />
        <div v-if="sideTheme === 'theme-dark'" class="setting-drawer-block-checbox-selectIcon" style="display: block">
          <el-icon><Check /></el-icon>
        </div>
      </div>
      <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-light')">
        <img src="@/assets/images/light.svg" alt="light" />
        <div v-if="sideTheme === 'theme-light'" class="setting-drawer-block-checbox-selectIcon" style="display: block">
          <el-icon><Check /></el-icon>
        </div>
      </div>
      <div class="setting-drawer-block-checkbox-item drawer-title" @click="handleTheme('theme-black')">
        <div v-if="sideTheme === 'theme-black'" class="setting-drawer-block-checbox-selectIcon" style="display: block">
          <el-icon><Check /></el-icon>
        </div>
        <el-icon><moon /></el-icon>
        {{ $t('layout.darkMode') }}
      </div>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layout.themeColor') }}</span>
      <span class="comp-style">
        <el-color-picker v-model="theme" :predefine="predefineColors" @change="themeChange" />
      </span>
    </div>
    <el-divider />

    <h3 class="drawer-title">{{ $t('layout.sysLayoutSet') }}</h3>
    <div class="drawer-item">
      <span>{{ $t('layout.open') }} TopNav</span>
      <span class="comp-style">
        <el-switch v-model="topNav" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>{{ $t('layout.open') }} Tags-Views</span>
      <span class="comp-style">
        <el-switch v-model="tagsView" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>{{ $t('layout.fixed') }} Header</span>
      <span class="comp-style">
        <el-switch v-model="fixedHeader" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>{{ $t('layout.show') }} Logo</span>
      <span class="comp-style">
        <el-switch v-model="sidebarLogo" class="drawer-switch" />
      </span>
    </div>

    <div class="drawer-item">
      <span>{{ $t('layout.dynamicTitle') }}</span>
      <span class="comp-style">
        <el-switch v-model="dynamicTitle" class="drawer-switch" />
      </span>
    </div>

    <el-divider />

    <el-button type="primary" plain icon="DocumentAdd" @click="saveSetting">{{ $t('layout.saveConfig') }}</el-button>
    <el-button plain icon="Refresh" @click="resetSetting">{{ $t('layout.resetConfig') }}</el-button>
  </el-drawer>
</template>

<script setup>
import variables from '@/assets/styles/variables.module.scss'
import originElementPlus from 'element-plus/theme-chalk/index.css'

import { useDynamicTitle } from '@/utils/dynamicTitle'
import { getLightColor } from '@/utils/index'

const { proxy } = getCurrentInstance()
const store = useStore()
const showSettings = ref(false)
const theme = ref(store.state.settings.theme)
const sideTheme = ref(store.state.settings.sideTheme)
const storeSettings = computed(() => store.state.settings)
const predefineColors = ref(['#409EFF', '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585'])

const blackTheme = ref(false)

/** 是否需要topnav */
const topNav = computed({
  get: () => storeSettings.value.topNav,
  set: (val) => {
    store.dispatch('settings/changeSetting', {
      key: 'topNav',
      value: val,
    })
    if (!val) {
      store.dispatch('app/toggleSideBarHide', false)
      store.commit('SET_SIDEBAR_ROUTERS', store.state.permission.defaultRoutes)
    }
  },
})
/** 是否需要tagview */
const tagsView = computed({
  get: () => storeSettings.value.tagsView,
  set: (val) => {
    store.dispatch('settings/changeSetting', {
      key: 'tagsView',
      value: val,
    })
  },
})
/**是否需要固定头部 */
const fixedHeader = computed({
  get: () => storeSettings.value.fixedHeader,
  set: (val) => {
    store.dispatch('settings/changeSetting', {
      key: 'fixedHeader',
      value: val,
    })
  },
})
/**是否需要侧边栏的logo */
const sidebarLogo = computed({
  get: () => storeSettings.value.sidebarLogo,
  set: (val) => {
    store.dispatch('settings/changeSetting', {
      key: 'sidebarLogo',
      value: val,
    })
  },
})
/**是否需要侧边栏的动态网页的title */
const dynamicTitle = computed({
  get: () => storeSettings.value.dynamicTitle,
  set: (val) => {
    store.dispatch('settings/changeSetting', {
      key: 'dynamicTitle',
      value: val,
    })
    // 动态设置网页标题
    useDynamicTitle()
  },
})
// 监控主题颜色
watch(
  () => theme,
  (val) => {
    themeChange(val.value)
  },
  {
    immediate: true,
  },
)
watch(
  () => sideTheme,
  (val) => {
    console.log(val.value)
    const body = document.documentElement
    if (val.value == 'theme-black') body.setAttribute('data-theme', 'theme-black')
    else body.setAttribute('data-theme', '')
  },
  {
    immediate: true,
  },
)
/**
 * 改变主题颜色
 */
function themeChange(val) {
  store.dispatch('settings/changeSetting', {
    key: 'theme',
    value: val,
  })
  theme.value = val
  // 设置element-plus ui主题
  document.documentElement.style.setProperty('--el-color-primary', val)

  // 颜色变浅
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, `${getLightColor(val, i / 10)}`)
  }
}
function handleTheme(val) {
  store.dispatch('settings/changeSetting', {
    key: 'sideTheme',
    value: val,
  })
  sideTheme.value = val
  const body = document.documentElement
  if (val == 'theme-black') body.setAttribute('data-theme', 'theme-black')
  else body.setAttribute('data-theme', '')
  console.log('change ' + val)
  blackTheme.value = val === 'theme-black'
}
function saveSetting() {
  proxy.$modal.loading('正在保存到本地，请稍候...')
  let layoutSetting = {
    topNav: storeSettings.value.topNav,
    tagsView: storeSettings.value.tagsView,
    fixedHeader: storeSettings.value.fixedHeader,
    sidebarLogo: storeSettings.value.sidebarLogo,
    dynamicTitle: storeSettings.value.dynamicTitle,
    sideTheme: storeSettings.value.sideTheme,
    theme: storeSettings.value.theme,
  }
  localStorage.setItem('layout-setting', JSON.stringify(layoutSetting))
  setTimeout(proxy.$modal.closeLoading(), 1000)
}
function resetSetting() {
  proxy.$modal.loading('正在清除设置缓存并刷新，请稍候...')
  localStorage.removeItem('layout-setting')
  setTimeout('window.location.reload()', 1000)
}
function openSetting() {
  showSettings.value = true
}

defineExpose({
  openSetting,
})
</script>

<style lang="scss" scoped>
.setting-drawer-title {
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 22px;
  font-weight: bold;
  .drawer-title {
    font-size: 14px;
  }
}
.setting-drawer-block-checbox {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;

  .setting-drawer-block-checbox-item {
    position: relative;
    margin-right: 16px;
    border-radius: 2px;
    cursor: pointer;

    img {
      width: 48px;
      height: 48px;
    }

    .custom-img {
      width: 48px;
      height: 38px;
      border-radius: 5px;
      box-shadow: 1px 1px 2px #898484;
    }

    .setting-drawer-block-checbox-selectIcon {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      padding-top: 15px;
      padding-left: 24px;
      color: #1890ff;
      font-weight: 700;
      font-size: 14px;
    }
  }
}

.drawer-item {
  color: rgba(0, 0, 0, 0.65);
  padding: 12px 0;
  font-size: 14px;

  .comp-style {
    float: right;
    margin: -3px 8px 0px 0px;
  }
}
</style>
