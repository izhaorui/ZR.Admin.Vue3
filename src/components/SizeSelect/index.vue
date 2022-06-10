<template>
  <div>
    <el-dropdown trigger="hover" @command="handleSetSize" style="vertical-align: middle">
      <svg-icon class-name="size-icon" name="size" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size === item.value" :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import useAppStore from '@/store/modules/app'
const appStore = useAppStore()
const size = computed(() => appStore.size)
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const sizeOptions = ref([
  { label: proxy.$t('layout.large'), value: 'large' },
  { label: proxy.$t('layout.default'), value: 'default' },
  { label: proxy.$t('layout.small'), value: 'small' },
])

// function refreshView() {
//   // In order to make the cached page re-rendered
//   store.dispatch('tagsView/delAllCachedViews', route)

//   const { fullPath } = route

//   nextTick(() => {
//     router.replace({
//       path: '/redirect' + fullPath,
//     })
//   })
// }
function handleSetSize(size) {
  proxy.$modal.loading('正在设置布局大小，请稍候...')
  appStore.setSize(size)
  setTimeout('window.location.reload()', 1000)
}
</script>

<style lang="scss" scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>
