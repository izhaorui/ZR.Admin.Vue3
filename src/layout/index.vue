<template>
  <el-container :class="classObj" class="app-layout" :style="{ '--current-color': theme }">
    <!-- 移动端打开菜单遮罩 -->
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar v-if="!sidebar.hide" />
    <el-container class="main-container flex-center" :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }">
      <el-header :class="{ 'fixed-header': fixedHeader }">
        <navbar @setLayout="setLayout" />
        <tags-view v-if="needTagsView" />
      </el-header>
      <el-main class="app-main">
        <router-view v-slot="{ Component, route }" :key="route.path">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
      <settings ref="settingRef" />
    </el-container>
  </el-container>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar/index.vue'
import { Navbar, Settings, TagsView } from './components'
import defaultSettings from '@/settings'

const store = useStore()
const theme = computed(() => store.state.settings.theme)
// const sideTheme = computed(() => store.state.settings.sideTheme)
const sidebar = computed(() => store.state.app.sidebar)
const device = computed(() => store.state.app.device)
const needTagsView = computed(() => store.state.settings.tagsView)
const fixedHeader = computed(() => store.state.settings.fixedHeader)

const route = useRoute()
store.dispatch('tagsView/addCachedView', route)
const cachedViews = computed(() => {
  return store.state.tagsView.cachedViews
})

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  mobile: device.value === 'mobile',
}))

const { width, height } = useWindowSize()
const WIDTH = 992 // refer to Bootstrap's responsive design

watchEffect(() => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    store.dispatch('app/closeSideBar', { withoutAnimation: false })
  }
  if (width.value - 1 < WIDTH) {
    store.dispatch('app/toggleDevice', 'mobile')
    store.dispatch('app/closeSideBar', { withoutAnimation: true })
  } else {
    store.dispatch('app/toggleDevice', 'desktop')
  }
})

function handleClickOutside() {
  store.dispatch('app/closeSideBar', { withoutAnimation: false })
}

const settingRef = ref(null)
function setLayout() {
  settingRef.value.openSetting()
}
</script>

<style lang="scss">
@import '@/assets/styles/mixin.scss';
@import '@/assets/styles/variables.module.scss';

.main-container {
  min-height: 100%;
  width: 100%;
  flex-direction: column;
  position: relative;
}

.app-layout {
  @include clearfix;
  // position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex: 1;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
// 移动端打开菜单背景遮罩
.drawer-bg {
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}
// 固定header
.fixed-header {
  position: sticky;
  position: -webkit-sticky;
  z-index: 9;
}

.mobile .fixed-header {
  width: 100%;
}
.app-main {
  /* 50= navbar  50  */
  // min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  height: 100%;
}

.el-header {
  --el-header-padding: 0 0px !important;
  --el-header-height: 50px !important;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }
  .el-header {
    --el-header-height: 84px !important;
  }
}
</style>
