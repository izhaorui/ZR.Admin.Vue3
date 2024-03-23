<template>
  <div class="header-search">
    <svg-icon class-name="search-icon" name="search" @click.stop="click" />
    <el-dialog v-model="open" width="500" @close="close">
      <el-select
        style="width: 100%"
        ref="headerSearchSelectRef"
        size="large"
        v-model="search"
        :remote-method="querySearch"
        filterable
        default-first-option
        remote
        popper-class="header-search-select"
        placement="bottom"
        placeholder="菜单搜索，支持标题、URL模糊查询"
        @change="change">
        <template #prefix>
          <el-icon color="#409EFC" class="no-inherit">
            <Search />
          </el-icon>
        </template>
        <el-option v-for="option in options" :key="option.item.path" :value="option.item" :label="option.item.title.join(' > ')">
          <span style="float: left">
            <div>
              {{ option.item.title.join(' > ') }}
              <div class="path">{{ option.item.path }}</div>
            </div>
          </span>
          <span style="float: right" @click.stop="handleLove(option.item)"> <svg-icon color="#ccc" name="star" /></span>
        </el-option>
      </el-select>
    </el-dialog>
  </div>
</template>

<script setup>
import Fuse from 'fuse.js'
import { getNormalPath } from '@/utils/ruoyi'
import { isHttp } from '@/utils/validate'
import usePermissionStore from '@/store/modules/permission'
import { findItem, color16 } from '@/utils/ruoyi'
const { proxy } = getCurrentInstance()
const search = ref('')
const options = ref([])
const searchPool = ref([])
const show = ref(false)
const open = ref(false)
const fuse = ref(undefined)
const headerSearchSelectRef = ref(null)
const router = useRouter()
const routes = computed(() => usePermissionStore().routes)

function click() {
  open.value = !open.value
  show.value = !show.value
  if (open.value) {
    setTimeout(() => {
      headerSearchSelectRef.value && headerSearchSelectRef.value.focus()
    }, 1)
  }
}
function close() {
  headerSearchSelectRef.value && headerSearchSelectRef.value.blur()
  options.value = []
  show.value = false
  open.value = false
}
function change(val) {
  const path = val.path
  const query = val.query
  if (path.startsWith('/link')) {
    var path2 = import.meta.env.VITE_APP_ROUTER_PREFIX + path
    path2 = path2.replace('//', '/')

    window.open(path2, '_blank')
  } else if (isHttp(path)) {
    // http(s):// 路径新窗口打开
    const pindex = path.indexOf('http')
    window.open(path.substr(pindex, path.length), '_blank')
  } else {
    if (query) {
      router.push({ path: path, query: JSON.parse(query) })
    } else {
      router.push(path)
    }
  }

  search.value = ''
  options.value = []
  nextTick(() => {
    show.value = false
    open.value = false
  })
}
function initFuse(list) {
  fuse.value = new Fuse(list, {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: [
      {
        name: 'title',
        weight: 0.7
      },
      {
        name: 'path',
        weight: 0.3
      }
    ]
  })
}
// Filter out the routes that can be displayed in the sidebar
// And generate the internationalized title
function generateRoutes(routes, basePath = '', prefixTitle = [], query = {}) {
  let res = []

  for (const r of routes) {
    // skip hidden router
    if (r.hidden) {
      continue
    }
    const p = r.path.length > 0 && r.path[0] === '/' ? r.path : '/' + r.path
    const data = {
      path: !isHttp(r.path) ? getNormalPath(basePath + p) : r.path,
      title: [...prefixTitle],
      icon: 'menu',
      menuTitle: ''
    }

    if (r.meta && r.meta.title) {
      data.title = [...data.title, r.meta.title]
      data.icon = r.meta.icon
      data.menuTitle = r.meta.title
      if (r.redirect !== 'noRedirect') {
        // only push the routes with title
        // special case: need to exclude parent router without redirect
        res.push(data)
      }
    }
    if (r.query) {
      data.query = r.query
    }

    // recursive child routes
    if (r.children) {
      const tempRoutes = generateRoutes(r.children, data.path, data.title)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  }
  return res
}
function querySearch(query) {
  if (query !== '') {
    options.value = fuse.value.search(query)
  } else {
    options.value = []
  }
}
/**
 * 添加快捷菜单
 * @param {*} item
 */
function handleLove(item) {
  var arraryObjectLocal = proxy.$cache.local.getJSON('commonlyUseMenu') || []

  var len = 12
  if (arraryObjectLocal.length >= len) {
    proxy.$modal.msgError(`最多可添加${len}个常用菜单`)
    return
  }
  let index = findItem(arraryObjectLocal, 'path', item.path)
  if (index <= -1) {
    arraryObjectLocal.push({ ...item, color: color16() })
    proxy.$cache.local.setJSON('commonlyUseMenu', arraryObjectLocal)
    proxy.$modal.msgSuccess('添加成功')
    usePermissionStore().setCommonlyUsedRoutes()
  } else {
    proxy.$modal.msgError('该菜单已存在')
  }
}

onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
})

watchEffect(() => {
  searchPool.value = generateRoutes(routes.value)
})

watch(show, (value) => {
  if (value) {
    document.body.addEventListener('click', close)
  } else {
    document.body.removeEventListener('click', close)
  }
})

watch(searchPool, (list) => {
  initFuse(list)
})
</script>

<style lang="scss" scoped>
.header-search {
  // height: 100%;
  // display: flex;
  // justify-content: center;
  // align-items: center;

  :deep(.el-dialog) {
    .el-dialog__header {
      display: none !important;
    }

    --el-dialog-bg-color: #00000;
    .el-dialog__body {
      padding: 0;
    }
  }

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }
}
.path {
  color: #ccc;
  font-size: 10px;
}
</style>
