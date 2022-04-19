<template>
  <div class="icon-body">
    <el-input v-model="iconName" style="position: relative;" clearable placeholder="请输入图标名称" @clear="filterIcons" @input="filterIcons">
      <template #prefix>
        <el-icon class="el-input__icon">
          <search />
        </el-icon>
      </template>
      <template #suffix>
        <el-icon class="el-input__icon" @click="selectedIcon('')">
          <delete />
        </el-icon>
      </template>
    </el-input>
    <el-tabs v-model="activeName">
      <el-tab-pane label="svg-icon" name="1">
        <div class="icon-list">
          <div v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
            <svg-icon :icon-class="item" style="height: 30px;width: 16px;" />
            <span>{{ item }}</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup>
import icons from './requireIcons'

const iconName = ref('')
const iconList = ref(icons)
const activeName = ref('1')
const emit = defineEmits(['selected'])

function filterIcons() {
  iconList.value = icons
  if (iconName.value) {
    iconList.value = icons.filter((item) => item.indexOf(iconName.value) !== -1)
  }
}

function selectedIcon(name) {
  emit('selected', name)
  document.body.click()
}

function reset() {
  iconName.value = ''
  iconList.value = icons
}

defineExpose({
  reset,
})
</script>

<style lang='scss' scoped>
.icon-body {
  width: 100%;
  padding: 10px;
  .icon-list {
    height: 200px;
    overflow-y: scroll;
    div {
      height: 30px;
      line-height: 30px;
      margin-bottom: -5px;
      cursor: pointer;
      width: 33%;
      float: left;
    }
    span {
      display: inline-block;
      vertical-align: -0.15em;
      fill: currentColor;
      overflow: hidden;
    }
  }
}
</style>