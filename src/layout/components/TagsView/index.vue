<template>
  <div id="tags-view-container" :class="['tags-view-container', { 'tags-view-container--chrome': tagsViewStyle === 'chrome' }]">
    <!-- 左切换箭头 -->
    <span class="tags-nav-btn tags-nav-btn--left" :class="{ disabled: !canScrollLeft }" @click="scrollLeft">
      <el-icon><arrow-left /></el-icon>
    </span>
    <el-divider direction="vertical" />
    <scroll-pane ref="scrollPaneRef" class="tags-view-wrapper" @scroll="handleScroll" @update-arrows="updateArrowState">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="{ active: isActive(tag) }"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        class="tags-view-item"
        :style="tagActiveStyle(tag)"
        @contextmenu.prevent="openMenu(tag, $event)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''">
        <svg-icon v-if="settingsStore.tagsShowIcon && tag.meta?.icon" :name="tag.meta?.icon" />
        <span v-if="tag.meta && tag.meta.titleKey">{{ $t(tag.meta.titleKey) }}</span>
        <span v-else>{{ tag.title }}</span>
        <span v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)" class="close-wrap">
          <close class="close" />
        </span>
      </router-link>
    </scroll-pane>

    <!-- 右切换箭头 -->
    <span class="tags-nav-btn" :class="{ disabled: !canScrollRight }" @click="scrollRight">
      <el-icon><arrow-right /></el-icon>
    </span>
    <el-divider direction="vertical" />

    <!-- 下拉操作菜单 -->
    <el-dropdown class="tags-action-dropdown" size="large" trigger="click" placement="bottom-end" @command="handleDropdownCommand">
      <span class="tags-action-btn">
        <el-icon><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu class="tags-dropdown-menu">
          <el-dropdown-item v-if="!isAffix(selectedDropdownTag)" command="close">
            <close style="width: 1em; height: 1em" />{{ $t('tagsView.close') }}
          </el-dropdown-item>
          <el-dropdown-item command="closeOthers"><circle-close style="width: 1em; height: 1em" />{{ $t('tagsView.closeOther') }}</el-dropdown-item>
          <el-dropdown-item command="closeLeft" :disabled="isFirstView()">
            <back style="width: 1em; height: 1em" />{{ $t('tagsView.closeLeft') }}
          </el-dropdown-item>
          <el-dropdown-item command="closeRight" :disabled="isLastView()">
            <right style="width: 1em; height: 1em" />{{ $t('tagsView.closeRight') }}
          </el-dropdown-item>
          <el-dropdown-item command="closeAll"><circle-close style="width: 1em; height: 1em" />{{ $t('tagsView.closeAll') }}</el-dropdown-item>
          <el-dropdown-item command="fullscreen" divided>
            <template v-if="!isFullscreen"><full-screen style="width: 1em; height: 1em" />{{ $t('tagsView.fullscreen') }}</template>
            <template v-else><close style="width: 1em; height: 1em" />{{ $t('tagsView.exitFullscreen') }}</template>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-divider direction="vertical" />
    <!-- 刷新按钮 -->
    <span class="tags-nav-btn" title="刷新页面" @click="refreshSelectedTag(selectedDropdownTag)">
      <el-icon><refresh-right /></el-icon>
    </span>

    <ul v-show="visible" :style="contextMenuStyle" class="tags-contextmenu">
      <li @click="handleContextMenuCommand('refresh')">{{ $t('tagsView.refresh') }}</li>
      <li v-if="!isAffix(selectedTag)" @click="handleContextMenuCommand('close')">{{ $t('tagsView.close') }}</li>
      <li @click="handleContextMenuCommand('closeOthers')">{{ $t('tagsView.closeOther') }}</li>
      <li :class="{ disabled: isFirstView() }" @click="!isFirstView() && handleContextMenuCommand('closeLeft')">{{ $t('tagsView.closeLeft') }}</li>
      <li :class="{ disabled: isLastView() }" @click="!isLastView() && handleContextMenuCommand('closeRight')">{{ $t('tagsView.closeRight') }}</li>
      <li @click="handleContextMenuCommand('closeAll')">{{ $t('tagsView.closeAll') }}</li>
    </ul>
  </div>
</template>

<script setup>
import ScrollPane from './ScrollPane'
import { getNormalPath } from '@/utils/ruoyi'
import useTagsViewStore from '@/store/modules/tagsView'
import usePermissionStore from '@/store/modules/permission'
import useSettingsStore from '@/store/modules/settings'
import { isHttp } from '@/utils/validate'
const visible = ref(false)
const selectedTag = ref({})
const affixTags = ref([])
const scrollPaneRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const isFullscreen = ref(false)
const hiddenElements = ref([])

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const visitedViews = computed(() => useTagsViewStore().visitedViews)
const routes = computed(() => usePermissionStore().routes)
const theme = computed(() => settingsStore.theme)
const tagsViewStyle = computed(() => settingsStore.tagsViewStyle)

const menuLeft = ref(0)
const menuTop = ref(0)
const contextMenuStyle = computed(() => ({
  left: `${menuLeft.value}px`,
  top: `${menuTop.value}px`
}))
const tagActiveStyle = (tag) => {
  if (!isActive(tag) || tagsViewStyle.value !== 'card') return {}

  return {
    'background-color': theme.value,
    'border-color': theme.value
  }
}
// 下拉菜单针对当前激活的 tag
const selectedDropdownTag = computed(() => visitedViews.value.find((v) => isActive(v)) || {})

watch(route, () => {
  addTags()
  moveToCurrentTag()
})
watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  } else {
    document.body.removeEventListener('click', closeMenu)
  }
})

watch(visitedViews, () => {
  nextTick(() => updateArrowState())
})

onMounted(() => {
  initTags()
  addTags()
  window.addEventListener('resize', updateArrowState)
  window.addEventListener('keydown', handleKeyDown)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateArrowState)
  window.removeEventListener('keydown', handleKeyDown)
})

function handleKeyDown(event) {
  // 当按下Esc键且处于全屏状态时，退出全屏
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}
function isActive(r) {
  return r.path === route.path
}
function isAffix(tag) {
  return tag.meta && tag.meta.affix
}
function isFirstView() {
  try {
    const tag = selectedTag.value && selectedTag.value.fullPath ? selectedTag.value : selectedDropdownTag.value
    return tag.fullPath === '/index' || tag.fullPath === visitedViews.value[1].fullPath
  } catch (err) {
    return false
  }
}
function isLastView() {
  try {
    const tag = selectedTag.value && selectedTag.value.fullPath ? selectedTag.value : selectedDropdownTag.value
    return tag.fullPath === visitedViews.value[visitedViews.value.length - 1].fullPath
  } catch (err) {
    return false
  }
}
function filterAffixTags(routes, basePath = '') {
  let tags = []
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}
function initTags() {
  const res = filterAffixTags(routes.value)
  affixTags.value = res
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
      useTagsViewStore().addVisitedView(tag)
    }
  }
}
function addTags() {
  const { name } = route
  if (name) {
    useTagsViewStore().addView(route)
    if (route.meta.link && isHttp(route.meta.link)) {
      console.log('add link', route.meta.link)
      useTagsViewStore().addIframeView(route)
    }
  }
  return false
}
function moveToCurrentTag() {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollPaneRef.value.moveToTarget(r)
        // when query is different then update
        if (r.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route)
        }
      }
    }
  })
}

function scrollLeft() {
  if (!canScrollLeft.value) return
  scrollPaneRef.value.scrollToStart()
}

function scrollRight() {
  if (!canScrollRight.value) return
  scrollPaneRef.value.scrollToEnd()
}

function updateArrowState() {
  nextTick(() => {
    if (scrollPaneRef.value) {
      const state = scrollPaneRef.value.getScrollState()
      canScrollLeft.value = state.canLeft
      canScrollRight.value = state.canRight
    }
  })
}

function toggleFullscreen() {
  const mainContainer = document.querySelector('.main-container')
  const navbar = document.querySelector('.navbar')
  const sidebar = document.querySelector('.sidebar-container')
  if (!mainContainer) return

  if (!isFullscreen.value) {
    mainContainer.classList.add('fullscreen-mode')
    document.body.style.overflow = 'hidden'
    const elementsToHide = [
      { el: navbar, originalDisplay: navbar?.style.display || '' },
      { el: sidebar, originalDisplay: sidebar?.style.display || '' }
    ]
    elementsToHide.forEach((item) => {
      if (item.el && item.el.style.display !== 'none') {
        item.originalDisplay = item.el.style.display
        item.el.style.display = 'none'
        hiddenElements.value.push(item)
      }
    })
    isFullscreen.value = true
  } else {
    mainContainer.classList.remove('fullscreen-mode')
    document.body.style.overflow = ''
    hiddenElements.value.forEach((item) => {
      if (item.el) {
        item.el.style.display = item.originalDisplay
      }
    })
    hiddenElements.value = []
    document.querySelector('.tags-action-btn').blur()
    isFullscreen.value = false
  }
}

function handleDropdownCommand(command) {
  const tag = selectedDropdownTag.value
  selectedTag.value = tag
  executeTagCommand(command, tag)
}

function handleContextMenuCommand(command) {
  const tag = selectedTag.value
  executeTagCommand(command, tag)
  closeMenu()
}

function executeTagCommand(command, tag) {
  switch (command) {
    case 'refresh':
      refreshSelectedTag(tag)
      break
    case 'fullscreen':
      toggleFullscreen()
      break
    case 'close':
      closeSelectedTag(tag)
      break
    case 'closeOthers':
      closeOthersTags()
      break
    case 'closeLeft':
      closeLeftTags()
      break
    case 'closeRight':
      closeRightTags()
      break
    case 'closeAll':
      closeAllTags(tag)
      break
  }
}

function openMenu(tag, event) {
  const menuMinWidth = 120
  const menuMinHeight = 190
  const maxLeft = window.innerWidth - menuMinWidth
  const maxTop = window.innerHeight - menuMinHeight
  selectedTag.value = tag
  menuLeft.value = Math.max(0, Math.min(event.clientX, maxLeft))
  menuTop.value = Math.max(0, Math.min(event.clientY, maxTop))
  visible.value = true
}

function refreshSelectedTag(view) {
  proxy.$tab.refreshPage(view)
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route)
  }
}
function closeSelectedTag(view) {
  proxy.$tab.closePage(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view)
    }
  })
}
function closeRightTags() {
  proxy.$tab.closeRightPage(selectedTag.value).then((visitedViews) => {
    if (!visitedViews.find((i) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}
function closeLeftTags() {
  proxy.$tab.closeLeftPage(selectedTag.value).then((visitedViews) => {
    if (!visitedViews.find((i) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews)
    }
  })
}
function closeOthersTags() {
  router.push(selectedTag.value).catch(() => {})
  proxy.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag()
  })
}
function closeAllTags(view) {
  proxy.$tab.closeAllPage().then(({ visitedViews }) => {
    if (affixTags.value.some((tag) => tag.path === route.path)) {
      return
    }
    toLastView(visitedViews, view)
  })
}
function toLastView(visitedViews, view) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.fullPath)
  } else {
    if (view.name === 'Dashboard') {
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}

function closeMenu() {
  visible.value = false
}
function handleScroll() {
  closeMenu()
  updateArrowState()
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: var(--base-tags-height);
  width: 100%;
  // box-shadow: 0 6px 20px rgba(17, 24, 39, 0.06);
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  // background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);

  $btn-width: 28px;
  $btn-color: #71717a;
  $btn-hover-bg: #f0f2f5;
  $btn-hover-color: #303133;
  $btn-disabled-color: #c0c4cc;
  $divider: 1px solid var(--tags-item-border, #d8dce5);

  .tags-nav-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: $btn-width;
    height: 34px;
    cursor: pointer;
    color: $btn-color;
    font-size: 13px;
    user-select: none;
    transition:
      background 0.15s,
      color 0.15s;
    border-radius: 8px;

    &:hover:not(.disabled) {
      background: #e9edf5;
      color: $btn-hover-color;
    }

    &.disabled {
      color: $btn-disabled-color;
      cursor: not-allowed;
    }
  }

  .tags-view-wrapper {
    .tags-view-item {
      z-index: 1;
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      color: var(--el-text-color-regular);
      padding: 0 10px;
      font-size: 12px;
      margin-left: 5px;
      // margin-top: 4px;
      border-radius: 7px;
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        background-color 0.18s ease,
        color 0.18s ease;

      .close {
        width: 1em;
        height: 1em;
        vertical-align: middle;
        border-radius: 50%;
        text-align: center;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-origin: 100% 50%;
        // display: none;
        &:before {
          transform: scale(0.6);
          display: inline-block;
          vertical-align: -3px;
        }
        &:hover {
          background-color: #b4bccc;
          color: #333;
          width: 12px !important;
          height: 12px !important;
        }
      }
      &:first-of-type {
        margin-left: 0;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &:not(.active) + .tags-view-item:not(.active)::before {
        content: '|';
        position: absolute;
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        color: color-mix(in srgb, var(--el-text-color-placeholder) 82%, transparent);
        pointer-events: none;
      }
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        background: rgba(64, 158, 255, 0.08);
        color: var(--el-color-primary);
      }
      &.active {
        background: linear-gradient(135deg, var(--el-color-primary) 0%, color-mix(in srgb, var(--el-color-primary) 78%, #1f9dff) 100%);
        border-color: transparent;
        box-shadow: 0 4px 12px color-mix(in srgb, var(--el-color-primary) 35%, transparent);
        color: #fff;
      }
    }
  }

  .tags-action-dropdown {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .tags-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: $btn-width;
    height: 34px;
    cursor: pointer;
    color: $btn-color;
    font-size: 13px;
    user-select: none;
    transition:
      background 0.15s,
      color 0.15s;
    border-radius: 8px;

    &:hover {
      background: #e9edf5;
      color: $btn-hover-color;
    }
  }

  &.tags-view-container--chrome {
    --chrome-strip-bg: #ffffff;
    --chrome-strip-border: var(--el-border-color-lighter, #e4e7ed);
    --chrome-tab-active-bg: var(--el-color-primary-light-9);
    --chrome-tab-hover-bg: var(--el-fill-color-light, #f5f7fa);
    --chrome-tab-text: var(--el-text-color-regular, #606266);
    --chrome-tab-text-active: var(--el-text-color-primary, #303133);
    --chrome-wing-r: 10px;

    overflow: visible;
    background: var(--chrome-strip-bg);
    // align-items: flex-end;

    .tags-nav-btn {
      align-self: stretch;
      height: auto;
      min-height: var(--base-tags-height);
      border-color: var(--chrome-strip-border);
    }

    .tags-action-btn {
      border-color: var(--chrome-strip-border);
    }

    .tags-view-wrapper {
      padding-top: 3px;

      .tags-view-item {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
        height: 30px;
        min-height: 30px;
        margin: 0 0 -1px;
        padding: 0 12px;
        font-size: 13px;
        font-weight: 400;
        line-height: 1.2;
        border: none !important;
        border-radius: 0;
        background: transparent !important;
        color: var(--chrome-tab-text);
        padding-top: 0 !important;
        box-shadow: none !important;
        white-space: nowrap;
        max-width: 220px;
        transition:
          background 0.12s ease,
          color 0.12s ease,
          border-radius 0.12s ease;

        > span:not(.close-wrap) {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .close {
          display: inline-block;
          transition:
            opacity 0.12s ease,
            background-color 0.12s ease,
            color 0.12s ease;
        }

        &::before,
        &::after {
          content: '' !important;
          display: block !important;
          position: absolute;
          bottom: 0;
          width: var(--chrome-wing-r);
          height: var(--chrome-wing-r);
          margin: 0 !important;
          pointer-events: none;
          background: transparent !important;
          border-radius: 0 !important;
          transition: box-shadow 0.12s ease;
        }

        &::before {
          left: calc(-1 * var(--chrome-wing-r));
          border-bottom-right-radius: var(--chrome-wing-r) !important;
          box-shadow: none;
        }

        &::after {
          right: calc(-1 * var(--chrome-wing-r));
          border-bottom-left-radius: var(--chrome-wing-r) !important;
          box-shadow: none;
        }

        &:first-of-type {
          margin-left: 6px;
        }

        &:last-of-type {
          margin-right: 10px;
        }

        &:not(.active) + .tags-view-item:not(.active) {
          padding-left: 12px;
        }

        &:not(.active) + .tags-view-item:not(.active)::before {
          content: '|';
          position: absolute;
          left: -2px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--el-text-color-placeholder, #a8abb2);
          pointer-events: none;
        }

        &:hover:not(.active) {
          background: var(--chrome-tab-hover-bg) !important;
          border-radius: 6px 6px 0 0;
          color: var(--el-text-color-primary, #303133);
          box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.06);
        }

        &.active {
          height: 31px;
          min-height: 31px;
          // padding: 0 14px;
          color: var(--chrome-tab-text-active) !important;
          // font-weight: 500;
          background: var(--chrome-tab-active-bg) !important;
          border: none !important;
          border-radius: var(--chrome-wing-r) var(--chrome-wing-r) 0 0;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);

          &::before {
            box-shadow: calc(var(--chrome-wing-r) * 0.5) calc(var(--chrome-wing-r) * 0.5) 0 calc(var(--chrome-wing-r) * 0.5)
              var(--chrome-tab-active-bg);
          }

          &::after {
            box-shadow: calc(var(--chrome-wing-r) * -0.5) calc(var(--chrome-wing-r) * 0.5) 0 calc(var(--chrome-wing-r) * 0.5)
              var(--chrome-tab-active-bg);
          }
        }
      }
    }
  }
}
.close-wrap {
  display: inline-block;
  width: 1em;
  margin-left: 5px;
  opacity: 0.72;
  transition: opacity 0.15s ease;
}

.tags-view-item:hover .close-wrap,
.tags-view-item.active .close-wrap {
  opacity: 1;
}
.svg-icon {
  margin-right: 5px;
}

.tags-contextmenu {
  margin: 0;
  padding: 6px 0;
  list-style: none;
  position: fixed;
  z-index: 3000;
  min-width: 120px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);

  li {
    margin: 0;
    padding: 8px 14px;
    font-size: 13px;
    color: #303133;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: #f5f7fa;
    }

    &.disabled {
      color: #c0c4cc;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}

/* 页签全屏模式样式 */
.main-container.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-container.fullscreen-mode .fixed-header {
  display: block !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100% !important;
  z-index: 1000;
}

.main-container.fullscreen-mode .fixed-header .navbar {
  display: none !important;
}

.main-container.fullscreen-mode .app-main {
  position: fixed;
  top: 34px;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 !important;
  padding: 0 !important;
  height: calc(100vh - 34px) !important;
  min-height: calc(100vh - 34px) !important;
  overflow: auto;
}
</style>
