<template>
  <template v-if="!item.hidden">
    <!-- ✅ 单个可见子菜单 -->
    <el-menu-item
      v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow"
      :index="resolvePath(onlyOneChild.path)">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <svg-icon class="menu-icon" :name="onlyOneChild.meta?.icon || item.meta?.icon" />

        <template v-if="isCollapse && !onlyOneChild.meta?.icon">
          {{ shortTitle(onlyOneChild.meta?.title) }}
        </template>

        <span v-if="onlyOneChild.meta?.titleKey">
          {{ $t(onlyOneChild.meta.titleKey) }}
        </span>
        <span v-else>
          {{ onlyOneChild.meta?.title }}
        </span>

        <svg-icon v-if="onlyOneChild.meta?.isNew == 1 && defaultSettings.menuShowNew" name="new" color="#fff" style="width: 50px; height: 25px" />
      </app-link>
    </el-menu-item>

    <!-- ✅ 多个子菜单，渲染为 el-sub-menu -->
    <el-sub-menu v-else :id="'submenu-' + resolvePath(item.path)" :index="resolvePath(item.path)">
      <template #title>
        <svg-icon class="menu-icon" :name="item.meta?.icon" />

        <template v-if="isCollapse && !item.meta?.icon">
          {{ shortTitle(item.meta?.title) }}
        </template>
        <template v-else>
          <span v-if="item.meta?.titleKey">
            {{ $t(item.meta.titleKey) }}
          </span>
          <span v-else>
            {{ item.meta?.title }}
          </span>

          <svg-icon v-if="item.meta?.isNew == 1 && defaultSettings.menuShowNew" name="new" color="#fff" style="width: 50px; height: 25px" />
        </template>
      </template>

      <sidebar-item
        v-for="(child, index) in visibleChildren"
        :key="child.path + index"
        :item="child"
        :is-nest="true"
        :base-path="resolvePath(child.path)" />
    </el-sub-menu>
  </template>
</template>

<script setup>
import { isExternal } from '@/utils/validate'
import { getNormalPath } from '@/utils/ruoyi'
import defaultSettings from '@/settings'
import AppLink from './Link.vue'

const props = defineProps({
  item: { type: Object, required: true },
  isNest: { type: Boolean, default: false },
  basePath: { type: String, default: '' },
  isCollapse: { type: Boolean, default: false }
})

// 判断一个子路由是否是“有效菜单项”（用于显示）
function isValidMenuChild(route) {
  if (!route || typeof route !== 'object') return false
  if (route.hidden) return false
  // path 异常（undefined 等）直接视为无效，避免空菜单路由
  if (typeof route.path !== 'string' || route.path.includes('undefined')) return false
  // 没有 meta 或标题的，也不作为可见菜单
  const meta = route.meta || {}
  if (!meta.title && !meta.titleKey) return false
  return true
}

/**
 * ✅ 过滤可见子菜单（核心优化点）
 */
const visibleChildren = computed(() => {
  return (props.item.children || []).filter((c) => isValidMenuChild(c))
})

// 旧写法里的 onlyOneChild
const onlyOneChild = ref({})

// 旧写法里的 hasOneShowingChild：结合 visibleChildren 做判断
function hasOneShowingChild(children = [], parent) {
  const showingChildren = (children || []).filter((c) => isValidMenuChild(c))

  if (showingChildren.length === 1) {
    onlyOneChild.value = showingChildren[0]
    return true
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

/**
 * 路径处理
 */
function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) return routePath
  if (isExternal(props.basePath)) return props.basePath

  if (routeQuery) {
    return {
      path: getNormalPath(props.basePath + '/' + routePath),
      query: JSON.parse(routeQuery)
    }
  }

  return getNormalPath(props.basePath + '/' + routePath)
}

/**
 * 标题缩短
 */
function shortTitle(title) {
  if (!title) return ''
  return title.length > 1 ? title.charAt(0) + '...' : title
}
</script>
