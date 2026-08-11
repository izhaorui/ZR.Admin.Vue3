<template>
  <el-aside :data-theme="sideTheme" class="sidebar">
    <logo v-if="showLogo" :collapse="isCollapse" />

    <el-scrollbar ref="sidebarScrollbar" wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        :active-text-color="theme"
        :collapse-transition="false"
        background-color="transparent"
        mode="vertical"
        @open="handleMenuOpen">
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
import { ref, nextTick } from 'vue'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarScrollbar = ref(null)

// 展开子菜单后，若新露出的子项超出可视区域，自动向下滚动使其可见
function handleMenuOpen(index) {
  if (isCollapse.value) return
  const wrap = sidebarScrollbar.value?.wrapRef
  if (!wrap) return
  const submenu = wrap.querySelector('#submenu-' + CSS.escape(index))
  if (!submenu) return
  // 展开动画(enter-from)未完成时内联高度为 0，需等过渡结束再测量真实底边
  const doScroll = () => {
    const wrapRect = wrap.getBoundingClientRect()
    const subRect = submenu.getBoundingClientRect()
    const submenuBottom = subRect.bottom - wrapRect.top + wrap.scrollTop
    if (submenuBottom > wrap.clientHeight + wrap.scrollTop) {
      wrap.scrollTo({ top: submenuBottom - wrap.clientHeight, behavior: 'smooth' })
    }
  }
  // 优先等展开过渡结束；兜底延时(过渡被禁用时也生效)
  submenu.addEventListener('transitionend', doScroll, { once: true })
  setTimeout(doScroll, 320)
}

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
