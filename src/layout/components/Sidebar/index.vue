<template>
  <el-aside :data-theme="sideTheme" class="layout-sidebar__container" :class="{ 'has-logo': showLogo }">
    <logo v-if="showLogo" :collapse="isCollapse" />

    <el-scrollbar :class="sideTheme" wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        background-color="transparent"
        mode="vertical">
        <sidebar-item v-for="(route, index) in sidebarRouters" :key="route.path + index" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/assets/styles/variables.module.scss'

const route = useRoute()
const store = useStore()

const sidebarRouters = computed(() => store.getters.sidebarRouters)
const showLogo = computed(() => store.state.settings.sidebarLogo)
const sideTheme = computed(() => store.state.settings.sideTheme)
const theme = computed(() => store.state.settings.theme)
const isCollapse = computed(() => !store.state.app.sidebar.opened)

const activeMenu = computed(() => {
  const { meta, path } = route
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})
</script>

<style lang="scss">
@import '@/assets/styles/variables.module.scss';
</style>
