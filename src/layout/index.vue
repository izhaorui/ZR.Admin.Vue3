<template>
  <el-container :class="classObj" class="app-layout" :style="{ '--current-color': theme }">
    <div v-if="classObj.mobile && classObj.openSidebar" class="drawer__background" @click="handleOutsideClick"></div>
    <sidebar v-else-if="!sidebar.hide && !classObj.mobile" />
    <sidebar v-if="classObj.mobile" />
    <el-container class="main-container flex-center" :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }">
      <el-header :class="{ 'fixed-header': fixedHeader }">
        <navbar @setLayout="setLayout" />
        <tags-view v-if="needTagsView" />
      </el-header>
      <el-main class="app-main">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in" v-if="!dev">
            <keep-alive :include="cachedViews">
              <component v-if="!route.meta.link" :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
          <keep-alive :include="cachedViews" v-else>
            <component v-if="!route.meta.link" :is="Component" :key="route.path" />
          </keep-alive>
        </router-view>
        <iframe-toggle />
      </el-main>
      <el-footer v-if="showFooter">
        <div v-html="defaultSettings.copyright"></div>
      </el-footer>
      <settings ref="settingRef" />
    </el-container>
  </el-container>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar/index.vue'
import { Navbar, Settings, TagsView } from './components'
import defaultSettings from '@/settings'
import iframeToggle from './components/IframeToggle/index'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import useTagsViewStore from '@/store/modules/tagsView'
const appStore = useAppStore()

const dev = import.meta.env.DEV
const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme)
const sidebar = computed(() => appStore.sidebar)
const device = computed(() => appStore.device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)
const showFooter = computed(() => settingsStore.showFooter)

// appMain 模块 start
const route = useRoute()
useTagsViewStore().addCachedView(route)
const cachedViews = computed(() => {
  return useTagsViewStore().cachedViews
})
//appMain 模块结束

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  mobile: device.value === 'mobile'
}))

const { width } = useWindowSize()
const WIDTH = 792 // refer to Bootstrap's responsive design

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    appStore.toggleDevice('mobile')
    // useAppStore().closeSideBar()
  } else {
    useAppStore().toggleDevice('desktop')

    if (width.value >= 1200) {
      //大屏
      appStore.sidebar.opened = true
    } else {
      appStore.closeSideBar()
    }
  }
})

const settingRef = ref(null)
function setLayout() {
  settingRef.value.openSetting()
}
function handleOutsideClick() {
  if (device.value === 'mobile' && sidebar.value.opened) {
    useAppStore().closeSideBar()
  }
}
</script>

<style lang="scss">
@import '@/assets/styles/mixin.scss';

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
  overflow-x: hidden;
}
.sidebar-mobile {
  .el-drawer__body {
    padding: 0;
  }
  @media screen and (max-width: 700px) {
    .el-drawer {
      width: var(--base-sidebar-width) !important;
    }
  }
}

.el-header {
  --el-header-padding: 0 0px !important;
  // --el-header-height: 50px !important;
}
.el-footer {
  --el-footer-height: var(--base-footer-height);
  line-height: var(--base-footer-height);
  text-align: center;
  color: #ccc;
  font-size: 14px;
  border-top: 1px solid #e7eaec;
  letter-spacing: 0.1rem;
}
.hasTagsView {
  // .app-main {
  //   min-height: calc(100vh - 84px - var(--base-footer-height));
  // }
  .el-header {
    --el-header-height: var(--el-header-height) + var(--el-tags-height) !important;
  }
}
.drawer__background {
  position: absolute;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.3;
}
</style>
