<template>
  <div class="top-right-btn">
    <slot></slot>
    <el-tooltip class="item" effect="dark" content="显隐列" placement="top" v-if="data">
      <el-dropdown :hide-on-click="false" style="margin-right: 10px" trigger="click">
        <el-button circle icon="menu" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="(item, index) in data" :key="index">
              <el-checkbox v-model="item.visible" :label="item.label"></el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-tooltip>

    <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top">
      <el-button circle icon="Search" @click="toggleSearch()" />
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="刷新" placement="top">
      <el-button circle icon="Refresh" @click="refresh()" />
    </el-tooltip>

    <!-- <el-tooltip class="item" effect="dark" content="显隐列" placement="top" v-if="data">
      <el-button circle icon="Menu" @click="showColumn()" />
    </el-tooltip> -->

    <!-- <el-dialog :title="title" v-model="open" append-to-body>
      <el-transfer :titles="['隐藏', '显示']" v-model="value" :data="data" @change="dataChange"></el-transfer>
    </el-dialog> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true
  },
  columns: {
    type: Object
  }
})

const data = computed(() => {
  if (!props.columns) return undefined
  return Object.values(props.columns).map((element, index) => {
    element.key = index
    return element
  })
})
const emits = defineEmits(['update:showSearch', 'queryTable'])

// 显隐数据
const value = ref([])
// 弹出层标题
const title = ref('显示/隐藏')
// 是否显示弹出层
const open = ref(false)

// 搜索
function toggleSearch() {
  emits('update:showSearch', !props.showSearch)
}

// 刷新
function refresh() {
  emits('queryTable')
}

// 右侧列表元素变化
function dataChange(item) {
  let arrSelected = data.value.filter((element) => value.value.indexOf(element.key) > -1)

  arrSelected.forEach((element) => {
    element.visible = true
  })
  let arrUnSelected = data.value.filter((element) => value.value.indexOf(element.key) == -1)
  arrUnSelected.forEach((element) => {
    element.visible = false
  })
}

// 打开显隐列dialog
function showColumn() {
  open.value = true
}
const init = () => {
  if (props.columns) {
    Object.values(props.columns).forEach((element, index) => {
      if (element.visible == true) value.value.push(index)
    })
  }
}

init()
</script>

<style lang="scss" scoped>
.top-right-btn {
  flex: 1;
  text-align: right;
}

:deep(.el-transfer__button) {
  border-radius: 50%;
  display: block;
  margin-left: 0px;
}

:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}

.my-el-transfer {
  text-align: center;
}
.el-dropdown-menu {
  max-height: 400px;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>
