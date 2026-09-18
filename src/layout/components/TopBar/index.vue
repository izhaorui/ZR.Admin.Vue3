<template>
  <div class="topbar-container">
    <logo v-show="showLogo" :collapse="false"></logo>
    <el-menu class="topbar-menu" :ellipsis="true" :default-active="activeMenu" :active-text-color="theme" mode="horizontal">
      <sidebar-item v-for="(route, index) in visibleRoutes" :key="route.path + index" :item="route" :base-path="route.path" />
    </el-menu>
  </div>
</template>

<script setup>
import Logo from '../Sidebar/Logo'
import SidebarItem from '../Sidebar/SidebarItem'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { getTopMenuActivePath } from '@/utils/navigation'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const showLogo = computed(() => settingsStore.sidebarLogo)
const theme = computed(() => settingsStore.theme)
const device = computed(() => appStore.device)
const activeMenu = computed(() => getTopMenuActivePath(route))

const visibleRoutes = computed(() => permissionStore.sidebarRouters.filter((item) => item && !item.hidden))
watch(route, () => {
  if (device.value === 'mobile') {
    appStore.closeSideBar()
  }
})
</script>
<style lang="scss" scoped>
.topbar-container {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
}

.el-menu--horizontal.el-menu {
  border-bottom: unset !important;
}
.el-menu--horizontal {
  height: var(--base-header-height) !important;
}
.topbar-menu {
  box-sizing: border-box;
  min-width: 0;
  width: 0 !important;
  max-width: 100%;
  flex: 1 1 0;
  overflow: hidden;
  background-color: transparent;
  border: none;
  // display: flex;
}
</style>
