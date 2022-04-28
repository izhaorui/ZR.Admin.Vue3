<template>
  <div class="icons-container">
    <el-tabs type="border-card">
      <el-tab-pane label="svg Icons">
        <div v-for="item of svgIconList" :key="item" class="item">
          <el-tooltip placement="top">
            <template #content> {{ generateIconCode(item) }} </template>
            <div class="icon-item">
              <svg-icon :name="item" style="height: 40px; width: 40px" />
            </div>
          </el-tooltip>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Element-UI Icons">
        <div v-for="item of elementIcons" :key="item">
          <el-tooltip placement="top">
            <template #content> {{ generateElementIconCode(item) }} </template>
            <div class="icon-item">
              <el-icon><component :is="item" /></el-icon>
            </div>
          </el-tooltip>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="icons">
import icons from '@/components/IconSelect/requireIcons'
import * as elIcons from '@element-plus/icons-vue'

const svgIconList = ref(icons)
const elementIcons = ref([])

for (const key in elIcons) {
  elementIcons.value.push(key)
}

function generateIconCode(symbol) {
  return `<svg-icon name="${symbol}" />`
}
function generateElementIconCode(symbol) {
  return `<el-icon><${symbol} /></el-icon>`
}
</script>

<style lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;

  .icon-item,
  .item {
    margin: 20px;
    height: 60px;
    text-align: center;
    width: 60px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
  }

  span {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }
  .disabled {
    pointer-events: none;
  }
}
</style>
