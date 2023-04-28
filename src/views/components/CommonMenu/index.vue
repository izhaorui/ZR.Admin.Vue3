<template>
  <div class="tool-wrap">
    <template v-for="item in commonRouters">
      <div class="tool-item">
        <span class="close-used" @click="removeRoute(item)" v-if="showRemove">
          <el-icon><CloseBold /></el-icon>
        </span>
        <router-link :to="item.path">
          <svg-icon :name="item.icon" class-name="card-panel-icon mb10" :color="item.color" />
          <div class="title">{{ item.menuTitle }}</div>
        </router-link>
      </div>
    </template>
    <el-empty :image-size="80" v-if="commonRouters && commonRouters.length <= 0" />
  </div>
</template>
<script setup>
import usePermissionStore from '@/store/modules/permission'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const showRemove = ref(false)
watch(
  () => props.modelValue,
  (val) => {
    showRemove.value = val
  },
  {
    immediate: true
  }
)
const commonRouters = computed(() => usePermissionStore().commonlyUsedRoutes)

// const { proxy } = getCurrentInstance()
// const menuList = ref([
//   { path: '/dashboard', title: '控制台', color: '#40c9c6', name: 'dashboard' },
//   { path: '/tool/gen', title: '代码生成', color: '#40c9c6', name: 'code', perms: ['tool:gen:list'] },
//   { path: '/tool/file', title: '文件存储', color: '#6A5ACD', name: 'upload', perms: ['tool:file:list'] },
//   // // { path: '/system/user', title: '角色管理', color: '#7FFF00', name: 'peoples' },
//   { path: '/system/dict', title: '字典管理', color: '#B0E0E6', name: 'dict', perms: ['system:dict:list'] },
//   { path: '/monitor/job', title: '定时任务', color: '#D2691E', name: 'job', perms: ['monitor:job:list'] },
//   { path: '/system/log/operlog', title: '操作日志', color: '#D2691E', name: 'form', perms: ['monitor:operlog:list'] }
//   // { path: '/system/log/logininfor', title: '登录日志', color: '#D2691E', name: 'logininfor' }
// ])

// function checkPermi(v) {
//   if (v && v.perms) {
//     return proxy.$auth.hasPermiOr(v.perms)
//   }
//   return true
// }
function removeRoute(item) {
  usePermissionStore().removeCommonlyUsedRoutes(item)
}
</script>
<style lang="scss" scoped>
.tool-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  .tool-item {
    text-align: center;
    width: 100px;
    margin-bottom: 30px;
    position: relative;

    .card-panel-icon {
      width: 25px;
      height: 25px;
    }
    .title {
      color: #606266;
      font-size: 13px;
    }
  }
  .close-used {
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
  }
}
</style>
