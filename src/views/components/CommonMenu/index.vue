<template>
  <div class="tool-wrap">
    <template v-for="item in menuList">
      <div class="tool-item" v-if="checkPermi(item)">
        <router-link :to="item.path">
          <svg-icon :name="item.name" class-name="card-panel-icon mb10" :color="item.color" />
          <div>{{ item.title }}</div>
        </router-link>
      </div>
    </template>
  </div>
</template>
<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const menuList = ref([
  { path: '/tool/gen', title: '代码生成', color: '#40c9c6', name: 'code', perms: ['tool:gen:list'] },
  { path: '/tool/file', title: '文件存储', color: '#6A5ACD', name: 'upload', perms: ['tool:file:list'] },
  // // { path: '/system/user', title: '角色管理', color: '#7FFF00', name: 'peoples' },
  { path: '/system/dict', title: '字典管理', color: '#B0E0E6', name: 'dict', perms: ['system:dict:list'] },
  { path: '/monitor/job', title: '定时任务', color: '#D2691E', name: 'job', perms: ['monitor:job:list'] },
  { path: '/system/log/operlog', title: '操作日志', color: '#D2691E', name: 'form', perms: ['monitor:operlog:list'] },
  // { path: '/system/log/logininfor', title: '登录日志', color: '#D2691E', name: 'logininfor' }
])

function checkPermi(v) {
  if (v && v.permi) {
    return proxy.$auth.hasPermiOr(v.perms)
  }
  return true
}
</script>
<style lang="scss" scoped>
.tool-wrap {
  display: flex;

  .tool-item {
    display: flex;
    flex-direction: column;
    text-align: center;
    width: 110px;

    .card-panel-icon {
      width: 30px;
      height: 30px;
    }
  }
}
</style>
