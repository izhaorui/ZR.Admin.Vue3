<template>
  <div :data-theme="sideTheme" class="layout-sidebar__container" :class="{ 'has-logo': showLogo }">
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
  </div>
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

.layout-sidebar__container {
  transition: width 0.28s;
  background-color: var(--base-menu-background);
  height: 100%;
  position: fixed;
  font-size: 0px;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  -webkit-box-shadow: 2px 0 14px rgb(0 21 41 / 10%);
  box-shadow: 2px 0 14px rgb(0 21 41 / 10%);
  .scrollbar-wrapper {
    overflow-x: hidden;
  }

  .el-scrollbar {
    flex: 1;
  }

  .el-scrollbar__bar.is-vertical {
    right: 0px;
  }
  // 去掉el-menu边框
  .el-menu {
    border: none;
  }
	
  .el-sub-menu .el-menu-item {
    padding-right: 0 !important;
  }
}
</style>
