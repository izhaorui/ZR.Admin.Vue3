<template>
  <el-aside :data-theme="sideTheme" class="sidebar" v-show="sidebarRouters.length > 1 && !sidebarRouters[0].children">
    <logo v-if="showLogo" :collapse="isCollapse" />

    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        background-color="transparent"
        mode="vertical">
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
          :isCollapse="isCollapse" />
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

// 只把真正的路由对象传给 SidebarItem，避免函数等异常项
const sidebarRouters = computed(() => permissionStore.sidebarRouters.filter((r) => r && typeof r === 'object' && typeof r.path === 'string'))
const showLogo = computed(() => settingsStore.sidebarLogo)
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)
const device = computed(() => appStore.device)
const activeMenu = computed(() => {
  const { meta, path } = route
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
watch(route, () => {
  if (device.value === 'mobile') {
    appStore.closeSideBar()
  }
  if (sidebarRouters.value.length === 1 && !sidebarRouters.value[0].children) appStore.toggleSideBarHide(true)
})
</script>
