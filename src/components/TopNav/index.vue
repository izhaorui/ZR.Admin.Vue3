<template>
  <el-menu
    :default-active="activeMenu"
    :active-text-color="theme"
    mode="horizontal"
    background-color="transparent"
    @select="handleSelect"
    :ellipsis="true">
    <el-menu-item v-for="(item, index) in topMenus" :key="item.path || index" :style="{ '--theme': theme }" :index="item.path">
      <svg-icon class="menu-icon" :name="item.meta.icon" />
      <template v-if="item.meta.titleKey" #title>
        {{ $t(item.meta.titleKey) }}
      </template>
      <template v-else-if="item.meta.title" #title>
        {{ item.meta.title }}
      </template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { constantRoutes } from '@/router'
import { isHttp } from '@/utils/validate'
import { useRouter } from 'vue-router'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { getTopMenuActivePath, parseRouteQuery, resolveMenuNavigatePath } from '@/utils/navigation'

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()

// 主题颜色
const theme = computed(() => settingsStore.theme)
// 所有的路由信息
const routers = computed(() => permissionStore.topbarRouters)

// 顶部显示菜单
const topMenus = computed(() => {
  let topMenus = []
  routers.value.map((menu) => {
    if (menu.hidden !== true) {
      // 兼容顶部栏一级菜单内部跳转
      if (menu.path === '/' && menu.children) {
        topMenus.push(menu.children[0])
      } else {
        topMenus.push(menu)
      }
    }
  })
  return topMenus
})
// 设置子路由
const childrenMenus = computed(() => {
  const childrenMenus = routers.value.flatMap((menu) => {
    return (menu.children || []).map((child) => {
      const childPath = child.path || ''
      const path = child.parentPath ? childPath : menu.path === '/' ? '/' + childPath : isHttp(childPath) ? childPath : `${menu.path}/${childPath}`
      return { ...child, path, parentPath: menu.path }
    })
  })
  return childrenMenus.concat(constantRoutes)
})

// 默认激活的菜单
const activeMenu = computed(() => getTopMenuActivePath(route))

/**
 * 选中菜单
 * @param key
 * @param keyPath
 */
function handleSelect(key) {
  const route = routers.value.find((item) => item.path === key)
  if (key.startsWith('/link')) {
    window.open(key, '_blank')
  } else if (isHttp(key)) {
    // http(s):// 路径新窗口打开
    window.open(key, '_blank')
  } else if (!route || !route.children) {
    // 没有子路由路径内部打开
    const targetPath = resolveMenuNavigatePath(key, childrenMenus.value)
    const routeMenu = childrenMenus.value.find((item) => item.path === key || item.path === targetPath)
    if (routeMenu && routeMenu.query) {
      const query = parseRouteQuery(routeMenu.query)
      router.push(query ? { path: targetPath, query } : { path: targetPath })
    } else {
      router.push({ path: targetPath })
    }
    activeRoutes(key)
    // appStore.toggleSideBarHide(true)
  } else {
    // 显示左侧联动菜单
    activeRoutes(key)
    appStore.toggleSideBarHide(false)
  }
}
// 当前激活的路由
function activeRoutes(key) {
  const children = childrenMenus.value || []
  const routes = children.filter(
    (item) => key === item.parentPath || (item.parentPath === '/' && key === item.path) || (key === '/index' && item.path === '')
  )
  if (routes.length > 0) {
    permissionStore.setSidebarRouters(routes)
  } else {
    appStore.toggleSideBarHide(true)
  }
  return routes
}

watch(
  () => activeMenu.value,
  (key) => activeRoutes(key),
  { immediate: true }
)
</script>

<style lang="scss" scoped>
// 修改默认样式
.el-menu--horizontal > .el-menu-item {
  // height: 50px !important;
  // line-height: 50px !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}
.el-menu--horizontal .menu-icon {
  margin-right: 5px;
}
/* sub-menu item */
.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  height: var(--base-header-height) !important;
  line-height: var(--base-header-height) !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}
.el-menu--horizontal.el-menu {
  border-bottom: unset !important;
}
.el-menu--horizontal {
  height: var(--base-header-height);
}
</style>
