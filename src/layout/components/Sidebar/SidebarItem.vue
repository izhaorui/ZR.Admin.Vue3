<template>
  <template v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <svg-icon :name="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" />

          <template v-if="onlyOneChild.meta.titleKey" #title>
            {{ $t(onlyOneChild.meta.titleKey) }}
          </template>
          <template v-else-if="onlyOneChild.meta.title" #title>
            {{ onlyOneChild.meta.title }}
          </template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)">
      <template #title>
        <svg-icon :name="item.meta && item.meta.icon" />
        <span v-if="item.meta && item.meta.titleKey">{{ $t(item.meta.titleKey) }}</span>
        <span v-else-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
      </template>

      <sidebar-item v-for="child in item.children" :key="child.path" :is-nest="true" :item="child" :base-path="resolvePath(child.path)" />
    </el-sub-menu>
  </template>
</template>

<script setup>
import { isExternal } from '@/utils/validate'
import AppLink from './Link'
import { getNormalPath } from '@/utils/ruoyi'

const props = defineProps({
  // route object
  item: {
    type: Object,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
  basePath: {
    type: String,
    default: '',
  },
})

const onlyOneChild = ref({})

function hasOneShowingChild(children = [], parent) {
  if (!children) {
    children = []
  }
  const showingChildren = children.filter((item) => {
    if (item.hidden) {
      return false
    } else {
      // Temp set(will be used if only has one showing child)
      onlyOneChild.value = item
      return true
    }
  })

  // When there is only one child router, the child router is displayed by default
  if (showingChildren.length === 1) {
    return true
  }

  // Show parent if there are no child router to display
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

function resolvePath(routePath, routeQuery) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routeQuery) {
    let query = JSON.parse(routeQuery)
    return {
      path: getNormalPath(props.basePath + '/' + routePath),
      query: query,
    }
  }
  return getNormalPath(props.basePath + '/' + routePath)
}

function hasTitle(title) {
  if (title.length > 5) {
    return title
  } else {
    return ''
  }
}
</script>
