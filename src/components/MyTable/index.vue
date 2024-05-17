<template>
  <el-table border highlight-current-row v-bind="$attrs" ref="elTableRef" @selection-change="selectionChange">
    <!-- 固定列插槽默认内容 -->
    <slot name="tableColumn">
      <el-table-column type="selection" width="55" align="center" v-if="selection" />
      <!-- <el-table-column type="index" width="55" label="序号" align="center" v-if="index"></el-table-column> -->
    </slot>

    <template v-for="(item, index) in columns">
      <el-table-column
        :key="index"
        :prop="item.prop"
        :label="item.label"
        :width="item.width ? item.width : ''"
        :align="item.align ? item.align : 'center'"
        :sortable="item.sortable"
        :show-overflow-tooltip="item.showOverflowTooltip"
        :fixed="item.fixed"
        :selectable="item.selectableFn"
        v-if="item.visible">
        <!-- type 对应列的类型。 如果设置了selection则显示多选框； -->
        <!-- 如果设置了 index 则显示该行的索引（从 1 开始计算）； -->
        <!-- 如果设置了 expand 则显示为一个可展开的按钮-->
        <!-- selection / index / expand -->

        <template #default="scope">
          <span v-if="item.type == colType.index">{{ scope.$index }}</span>
          <span v-else-if="item.type == colType.date">
            <el-tooltip :content="scope.row[item.prop]" placement="top">
              {{ showTime(scope.row[item.prop]) }}
            </el-tooltip>
          </span>
          <template v-else-if="item.type == colType.actions">
            <el-button link type="primary" icon="edit" @click="handleEdit(scope)">编辑</el-button>
            <el-button link type="danger" icon="delete" @click="handleDelete(scope)">删除</el-button>
          </template>
          <DictTag v-else-if="item.type == colType.dict" :options="dicts[item.dictType]" :value="scope.row[item.prop]"></DictTag>

          <ImagePreview v-else-if="item.type == colType.img" style="width: 40px" :src="scope.row[item.prop]"></ImagePreview>
          <slot v-else-if="item.type == colType.slot" :name="item.prop" :scope="scope" :row="scope.row"> </slot>
          <span v-else>{{ scope.row[item.prop] }}</span>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script setup>
import { showTime } from '@/utils/index'
const colType = {
  slot: 'slot',
  date: 'date',
  img: 'img',
  text: 'text',
  dict: 'dict',
  index: 'index',
  actions: 'actions'
}

const props = defineProps({
  /**
   * 所有字典
   */
  dicts: {},
  //表头数据
  columns: {
    type: Array,
    default: []
  },
  //是否首列索引
  index: {
    type: Boolean,
    default: false
  },
  //是否首列可选
  selection: {
    type: Boolean,
    default: false
  }
})
// 抛出事件：选择项变化；页面变化
const emits = defineEmits(['selectionChange', 'delete', 'edit'])

// 暴露el-table组件，使父组件通过 父组件Ref.value.element.方法名 来获取并使用el-table组件的方法
const elTableRef = ref(null)
defineExpose({ element: elTableRef })

const selectionChange = (selection) => {
  emits('selectionChange', selection)
}
function handleDelete(scope) {
  emits('delete', scope)
}
function handleEdit(scope) {
  emits('edit', scope)
}
</script>
