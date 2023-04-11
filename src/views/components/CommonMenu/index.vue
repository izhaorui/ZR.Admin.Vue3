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
  { path: '/tool/gen', title: '代码生成', color: '#40c9c6', name: 'code', permi: ['tool:gen:list'] },
  { path: '/tool/file', title: '文件存储', color: '#6A5ACD', name: 'upload', permi: ['tool:file:list'] },
  // // { path: '/system/user', title: '角色管理', color: '#7FFF00', name: 'peoples' },
  { path: '/system/dict', title: '字典管理', color: '#B0E0E6', name: 'dict', permi: ['system:dict:list'] },
  { path: '/monitor/job', title: '定时任务', color: '#D2691E', name: 'job', permi: ['monitor:job:list'] }
])

function checkPermi(v) {
  if (v && v.permi) {
    return proxy.$auth.hasPermiOr(v.permi)
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
