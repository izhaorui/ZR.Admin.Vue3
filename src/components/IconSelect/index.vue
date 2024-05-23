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
            <svg-icon :name="item" style="height: 20px; width: 20px" />
            <div class="name">{{ item }}</div>
          </div>
        </div>
        <div class="help text-muted mt5" @click="handleHelp">
          <svg-icon name="question"></svg-icon>
          如何增加icon
        </div>
      </el-tab-pane>
      <el-tab-pane label="Element-UI Icons" name="2">
        <div class="icon-list">
          <div class="icon-item mb10" v-for="item of elementIcons" :key="item" @click="selectedIcon(item, 'ele-')">
            <svg-icon :name="'ele-' + item" style="height: 25px; width: 25px" />
            <div class="name">{{ item }}</div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="网络图" name="3">
        <el-input v-model="iconName" placeholder="请输入网络路径">
          <template #append>
            <el-button type="primary" @click="selectedImgIcon()">确定</el-button>
          </template>
        </el-input>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import icons from './requireIcons'
import * as elIcons from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance()
const elementIcons = ref([])
const elementIconList = ref([])
for (const key in elIcons) {
  elementIcons.value.push(key)
  elementIconList.value.push(key)
}
// 搜索的图标名
const iconName = ref('')
const iconList = ref(icons)
const activeName = ref('1')
const emit = defineEmits(['selected'])

function filterIcons() {
  if (iconName.value) {
    iconList.value = icons.filter((item) => item.indexOf(iconName.value) !== -1)
    elementIcons.value = elementIconList.value.filter((item) => item.toLocaleLowerCase().indexOf(iconName.value.toLocaleLowerCase()) !== -1)
  } else {
    iconList.value = icons
    elementIcons.value = elementIconList.value
  }
}

function selectedIcon(name, prefix) {
  const iconName = prefix != undefined ? prefix + name : name
  emit('selected', iconName)
  document.body.click()
}

function selectedImgIcon() {
  emit('selected', iconName.value)
  document.body.click()
}
function reset() {
  iconName.value = ''
  iconList.value = icons
}
function handleHelp() {
  proxy.$modal.msg('请将svg图标放置在目录/src/assets/icons/svg里面')
}
defineExpose({
  reset
})
</script>

<style lang="scss" scoped>
.icon-body {
  width: 100%;
  padding: 10px;
  .icon-list {
    overflow-y: scroll;
    display: grid;
    flex-wrap: wrap;
    height: 200px;
    grid-template-columns: repeat(5, 90px);

    .icon-item {
      cursor: pointer;
      text-align: center;

      .name {
        font-size: 11px;
      }
    }
  }
}
.help {
  cursor: pointer;
}
</style>
