<template>
  <el-drawer v-model="showSettings" title="系统设置" :with-header="false" direction="rtl" size="330px">
    <!-- <div class="setting-drawer-title">
      <h3 class="drawer-title">导航模式</h3>
    </div> -->
    <el-divider>{{ $t('layout.navMode') }}</el-divider>
    <div class="nav-wrap">
      <el-tooltip content="左侧菜单" placement="bottom">
        <div class="item left" @click="handleNavType(1)" :class="{ activeItem: navType == 1 }">
          <b></b>
          <b></b>
        </div>
      </el-tooltip>

      <el-tooltip content="混合菜单" placement="bottom">
        <div class="item mix" @click="handleNavType(2)" :class="{ activeItem: navType == 2 }">
          <b></b>
          <b></b>
        </div>
      </el-tooltip>
      <el-tooltip content="顶部菜单" placement="bottom">
        <div class="item top" @click="handleNavType(3)" :class="{ activeItem: navType == 3 }">
          <b></b>
          <b></b>
        </div>
      </el-tooltip>
    </div>
    <div class="drawer-item" style="text-align: center">
      <!-- <el-radio-group v-model="mode" size="small">
        <el-radio value="dark">{{ $t('layout.darkMode') }}</el-radio>
        <el-radio value="light">{{ $t('layout.lightMode') }}</el-radio>
      </el-radio-group> -->
      <el-divider> {{ $t('layout.themeStyleSet') }} </el-divider>
      <el-switch v-model="mode" inactive-icon="Sunny" active-icon="Moon" active-value="dark" inactive-value="light"></el-switch>
    </div>
    <div class="drawer-item">
      <!-- <div>侧边栏颜色</div> -->
      <el-divider> {{ $t('layout.sideColor') }} </el-divider>

      <div class="mt10">
        <span
          class="color-item"
          :class="{ sideActive: item.name == sideTheme }"
          :style="{ 'background-color': item.color }"
          v-for="item in sideColors"
          @click="handleSideTheme(item.name)">
          <svg-icon name="ele-check"></svg-icon>
        </span>
      </div>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layout.themeColor') }}</span>
      <span class="comp-style quick-color-wrap">
        <el-color-picker v-model="theme" :predefine="predefineColors" @change="themeChange" />
      </span>
    </div>
    <el-divider />

    <div class="drawer-item">
      <span>{{ $t('layout.open') }} {{ $t('layout.tagsView') }}</span>
      <span class="comp-style">
        <el-switch v-model="tagsView" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layout.open') }} {{ $t('layout.bottomBar') }}</span>
      <span class="comp-style">
        <el-switch v-model="showFooter" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layout.openWatermark') }}</span>
      <span class="comp-style">
        <el-switch v-model="showWatermark" class="drawer-switch" />
      </span>
    </div>
    <!-- <div class="drawer-item">
      <span>{{ $t('layout.fixed') }} Header</span>
      <span class="comp-style">
        <el-switch v-model="fixedHeader" class="drawer-switch" />
      </span>
    </div> -->

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

    <div class="drawer-item">
      <span>{{ $t('layout.tagsPersist') }}</span>
      <span class="comp-style">
        <el-switch v-model="tabsPersist" class="drawer-switch" />
      </span>
    </div>
    <div class="drawer-item">
      <span>{{ $t('layout.tagsShowIcon') }}</span>
      <span class="comp-style">
        <el-switch v-model="tabsShowIcon" class="drawer-switch" />
      </span>
    </div>
    <el-divider />

    <!-- <el-button type="primary" plain icon="DocumentAdd" @click="saveSetting">{{ $t('layout.saveConfig') }}</el-button> -->
    <el-button plain icon="Refresh" @click="resetSetting">{{ $t('layout.resetConfig') }}</el-button>
  </el-drawer>
</template>

<script setup>
import 'element-plus/theme-chalk/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { useColorMode } from '@vueuse/core'
import { useDynamicTitle } from '@/utils/dynamicTitle'
import { getLightColor } from '@/utils/index'
import { getmark } from '@/utils/wartermark'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import useUserStore from '@/store/modules/user'
const { proxy } = getCurrentInstance()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const showSettings = ref(false)
const theme = ref(settingsStore.theme)
const sideTheme = ref(settingsStore.sideTheme)
const storeSettings = computed(() => settingsStore)
const predefineColors = ref(['#409EFF', '#ff4500', '#ff8c00', '#00ced1', '#1e90ff', '#c71585'])
const sideColors = ref([
  { color: '#324157', name: 'theme-black' },
  { color: '#fff', name: '' }
])
const { setWatermark, removeWatermark } = getmark()
// 可以手动更改当前值 model.value = 'cafe'
const mode = useColorMode({
  modes: {
    // custom colors
    contrast: 'dark contrast',
    cafe: 'cafe',
    auto: 'auto'
  }
})
/** 是否需要topnav */
const topNav = computed({
  get: () => storeSettings.value.topNav,
  set: (val) => {
    settingsStore.changeSetting({ key: 'topNav', value: val })
    if (!val) {
      appStore.toggleSideBarHide(false)
      permissionStore.setSidebarRouters(permissionStore.defaultRoutes)
    }
  }
})
/**导航类型 */
const navType = computed({
  get: () => storeSettings.value.navType,
  set: (val) => {
    settingsStore.changeSetting({ key: 'navType', value: val })
  }
})
/** 是否需要tagview */
const tagsView = computed({
  get: () => storeSettings.value.tagsView,
  set: (val) => {
    settingsStore.changeSetting({ key: 'tagsView', value: val })
  }
})
/**是否需要固定头部 */
const fixedHeader = computed({
  get: () => storeSettings.value.fixedHeader,
  set: (val) => {
    settingsStore.changeSetting({ key: 'fixedHeader', value: val })
  }
})
// 是否显示底部
const showFooter = computed({
  get: () => storeSettings.value.showFooter,
  set: (val) => {
    settingsStore.changeSetting({ key: 'showFooter', value: val })
  }
})
/**是否需要侧边栏的logo */
const sidebarLogo = computed({
  get: () => storeSettings.value.sidebarLogo,
  set: (val) => {
    settingsStore.changeSetting({ key: 'sidebarLogo', value: val })
  }
})
/**是否需要侧边栏的动态网页的title */
const dynamicTitle = computed({
  get: () => storeSettings.value.dynamicTitle,
  set: (val) => {
    settingsStore.changeSetting({ key: 'dynamicTitle', value: val })
    // 动态设置网页标题
    useDynamicTitle()
  }
})
/**是否显示水印 */
const showWatermark = computed({
  get: () => storeSettings.value.showWatermark,
  set: (val) => {
    settingsStore.changeSetting({ key: 'showWatermark', value: val })
    changeWatermark()
  }
})

/**标签持久化 */
const tabsPersist = computed({
  get: () => storeSettings.value.tagsViewPersist,
  set: (val) => {
    settingsStore.changeSetting({ key: 'tagsViewPersist', value: val })
  }
})
/**标签显示icon */
const tabsShowIcon = computed({
  get: () => storeSettings.value.tagsShowIcon,
  set: (val) => {
    settingsStore.changeSetting({ key: 'tagsShowIcon', value: val })
  }
})
const changeWatermark = () => {
  storeSettings.value.showWatermark ? setWatermark(useUserStore().userInfo.userName) : removeWatermark()
}
// 开启水印
changeWatermark()
// 监控主题颜色
watch(
  () => theme,
  (val) => {
    themeChange(val.value)
  },
  {
    immediate: true
  }
)
watch(
  () => sideTheme,
  (val) => {
    const body = document.documentElement
    body.setAttribute('data-theme', '')
  },
  {
    immediate: true
  }
)
watch(
  () => mode,
  (val) => {
    settingsStore.changeSetting({ key: 'codeMode', value: val.value })
    if (val.value === 'dark') {
      handleSideTheme('')
    }
  },
  {
    immediate: true,
    deep: true
  }
)
// 导航模式
watch(
  () => navType,
  (val) => {
    //侧边栏
    if (val.value == 1) {
      appStore.toggleSideBarHide(false)
      permissionStore.setSidebarRouters(permissionStore.defaultRoutes)
    }
    //top
    if (val.value == 3) {
      appStore.toggleSideBarHide(true)
      permissionStore.setSidebarRouters(permissionStore.defaultRoutes)
    }
  },
  {
    immediate: true,
    deep: true
  }
)
/**
 * 改变主题颜色
 */
function themeChange(val) {
  settingsStore.changeSetting({ key: 'theme', value: val })
  theme.value = val
  // 设置element-plus ui主题
  document.documentElement.style.setProperty('--el-color-primary', val)
  document.documentElement.style.setProperty('--el-color-primary-dark-2', val)
  var num = mode.value == 'dark' ? 8 : 9

  // 颜色变浅
  for (let i = 1; i <= num; i++) {
    document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, `${getLightColor(val, i / 10)}`)
  }
}
function handleSideTheme(val) {
  settingsStore.changeSetting({ key: 'sideTheme', value: val })
  sideTheme.value = val
  const body = document.documentElement
  if (val == 'theme-black') body.setAttribute('data-theme', 'theme-black')
  else body.removeAttribute('data-theme')
}
function handleNavType(val) {
  settingsStore.changeSetting({ key: 'navType', value: val })
}
function saveSetting() {
  proxy.$modal.loading('正在保存到本地，请稍候...')
  // let layoutSetting = {
  //   topNav: storeSettings.value.topNav,
  //   tagsView: storeSettings.value.tagsView,
  //   fixedHeader: storeSettings.value.fixedHeader,
  //   sidebarLogo: storeSettings.value.sidebarLogo,
  //   dynamicTitle: storeSettings.value.dynamicTitle,
  //   sideTheme: storeSettings.value.sideTheme,
  //   theme: storeSettings.value.theme,
  //   showFooter: storeSettings.value.showFooter,
  //   showWatermark: storeSettings.value.showWatermark,
  //   tagsViewPersist: storeSettings.value.tagsViewPersist,
  //   tagsShowIcon: storeSettings.value.tagsShowIcon
  // }
  // localStorage.setItem('layout-setting', JSON.stringify(layoutSetting))
  setTimeout(proxy.$modal.closeLoading(), 100)
  setTimeout('window.location.reload()', 200)
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
  openSetting
})
</script>

<style lang="scss" scoped>
.setting-drawer-title {
  margin-bottom: 12px;
  color: var(--base-text-color-rgba);
  line-height: 22px;
  font-weight: bold;
  .drawer-title {
    font-size: 14px;
  }
}

// 导航模式
.nav-wrap {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;

  .activeItem {
    border: 2px solid var(--el-color-primary) !important;
  }

  .item {
    position: relative;
    margin-right: 16px;
    cursor: pointer;
    width: 56px;
    height: 48px;
    border-radius: 4px;
    background: #f0f2f5;
    border: 2px solid transparent;
    // box-shadow: 0 1px 2.5px #0000002e;
  }

  .left {
    b:first-child {
      display: block;
      height: 30%;
      background: #fff;
    }
    b:last-child {
      width: 30%;
      background: #1b2a47;
      position: absolute;
      height: 100%;
      top: 0;
      border-radius: 4px 0 0 4px;
    }
  }
  .mix {
    b:first-child {
      border-radius: 4px 4px 0 0;
      display: block;
      height: 30%;
      background: #1b2a47;
    }
    b:last-child {
      width: 30%;
      background: #1b2a47;
      position: absolute;
      height: 70%;
      border-radius: 0 0 0 4px;
    }
  }
  .top {
    b:first-child {
      display: block;
      height: 30%;
      background: #1b2a47;
      border-radius: 4px 4px 0 0;
    }
  }
}

.drawer-item {
  color: var(--base-text-color-rgba);
  padding: 12px 0;
  font-size: 14px;

  .color-item {
    width: 25px;
    height: 25px;
    display: inline-flex;
    margin-right: 10px;
    cursor: pointer;
    border-radius: 3px;
    border: 2px solid #ccc;
    position: relative;
    --color: transparent;

    .el-icon {
      height: 1.6em;
      width: 1.6em;
    }
  }
  .sideActive {
    --color: #fff;
    border: 2px solid var(--el-color-primary);
  }
  .comp-style {
    float: right;
    margin: -3px 8px 0px 0px;
  }
  .quick-color-wrap {
    display: flex;
    align-items: center;

    span {
      width: 15px;
      height: 15px;
      margin-right: 10px;
      cursor: pointer;
    }
  }
}
</style>
