<template>
  <div class="icon-body">
    <el-input v-model="iconName" style="position: relative" clearable placeholder="请输入图标名称" @clear="filterIcons" @input="filterIcons">
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
          <div class="icon-item mb10" v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item, '')">
            <svg-icon :name="item" style="height: 30px; width: 16px" />
            <div class="name">{{ item }}</div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Element-UI Icons" name="2">
        <div class="icon-list">
          <div class="icon-item mb10" v-for="item of elementIcons" :key="item" @click="selectedIcon(item, 'ele-')">
            <svg-icon :name="'ele-' + item" style="height: 30px; width: 16px" />
            <div class="name">{{ item }}</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import icons from './requireIcons'
import * as elIcons from '@element-plus/icons-vue'

const elementIcons = ref([])
for (const key in elIcons) {
  elementIcons.value.push(key)
}
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

function selectedIcon(name, prefix) {
  const iconName = prefix != undefined ? prefix + name : name
  console.log(iconName)
  emit('selected', iconName)
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

<style lang="scss" scoped>
.icon-body {
  width: 100%;
  padding: 10px;
  .icon-list {
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    height: 200px;

    .icon-item {
      // height: 30px;
      // line-height: 30px;
      // margin-bottom: -5px;
      cursor: pointer;
      width: 19%;
      text-align: center;
      // float: left;
    }
    .name {
      // display: inline-block;
      // vertical-align: -0.15em;
      // fill: currentColor;
      // overflow: hidden;
    }
  }
}
</style>
