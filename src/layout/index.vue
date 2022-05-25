<template>
  <el-container :class="classObj" class="app-layout" :style="{ '--current-color': theme }">
    <!-- 移动端打开菜单遮罩 -->
    <el-drawer v-if="device === 'mobile'" v-model="menuDrawer" :with-header="false" modal-class="sidebar-mobile" direction="ltr">
      <sidebar />
    </el-drawer>
    <sidebar v-else-if="!sidebar.hide" />

    <el-container class="main-container flex-center" :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }">
      <el-header :class="{ 'fixed-header': fixedHeader }">
        <navbar @setLayout="setLayout" />
        <tags-view v-if="needTagsView" />
      </el-header>
      <el-main class="app-main">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
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
const menuDrawer = computed({
  get: () => store.state.app.sidebar.opened,
  set: (val) => {
    store.dispatch('app/toggleSideBar')
  },
})
let store = useStore()
const theme = computed(() => store.state.settings.theme)
const sidebar = computed(() => store.state.app.sidebar)
const device = computed(() => store.state.app.device)
const needTagsView = computed(() => store.state.settings.tagsView)
const fixedHeader = computed(() => store.state.settings.fixedHeader)
const showFooter = computed(() => store.state.settings.showFooter)

// appMain 模块 start
const route = useRoute()
store.dispatch('tagsView/addCachedView', route)
const cachedViews = computed(() => {
  return store.state.tagsView.cachedViews
})
//appMain 模块结束

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  mobile: device.value === 'mobile',
}))

const { width, height } = useWindowSize()
const WIDTH = 992 // refer to Bootstrap's responsive design

watchEffect(() => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    // store.dispatch('app/closeSideBar')
  }
  if (width.value - 1 < WIDTH) {
    store.dispatch('app/toggleDevice', 'mobile')
    // store.dispatch('app/closeSideBar')
  } else {
    store.dispatch('app/toggleDevice', 'desktop')
  }
})

function handleClickOutside() {
  store.dispatch('app/closeSideBar')
}

const settingRef = ref(null)
function setLayout() {
  settingRef.value.openSetting()
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
</style>
