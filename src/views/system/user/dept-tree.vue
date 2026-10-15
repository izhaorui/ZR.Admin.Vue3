<template>
  <div class="dept-tree">
    <div class="head-container">
      <el-input v-model="deptName" placeholder="请输入部门名称" clearable prefix-icon="search" style="margin-bottom: 20px" />
    </div>
    <div class="head-container">
      <el-tree
        :data="deptOptions"
        :props="{ label: 'label', children: 'children' }"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :current-node-key="currentKey"
        ref="treeRef"
        node-key="id"
        highlight-current
        default-expand-all
        @node-click="handleNodeClick">
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>
              <svg-icon name="index" v-if="data.children && data.children.length > 0"></svg-icon>
              {{ node.label }}
            </span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup>
/**
 * 部门树（页面私有组件）。
 * 桌面端嵌在 el-splitter 左栏，移动端放进 el-drawer 复用，
 * 所以把搜索框、树本身与选中高亮都收在这里，避免两处各写一份。
 */
defineProps({
  // 部门树数据
  deptOptions: {
    type: Array,
    default: () => []
  },
  // 当前选中的部门 id，用于回显高亮
  currentKey: {
    type: [Number, String],
    default: undefined
  }
})
const emit = defineEmits(['node-click'])
const treeRef = ref()
const deptName = ref('')
/** 通过条件过滤节点  */
function filterNode(value, data) {
  if (!value) return true
  return data.label.indexOf(value) !== -1
}
/** 根据名称筛选部门树 */
watch(deptName, (val) => {
  treeRef.value?.filter(val)
})
function handleNodeClick(data) {
  emit('node-click', data)
}
/** 父组件清空筛选条件时，同步去掉树上的高亮 */
function setCurrentKey(key) {
  treeRef.value?.setCurrentKey(key)
}
defineExpose({ setCurrentKey })
</script>
