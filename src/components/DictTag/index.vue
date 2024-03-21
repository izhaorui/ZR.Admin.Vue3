<template>
  <template v-for="(item, index) in dataList">
    <template v-if="values.includes(item.dictValue)">
      <el-tag
        v-if="dictValues.includes(item.listClass)"
        size="small"
        :disable-transitions="true"
        :index="index"
        :type="item.listClass"
        :class="item.cssClass">
        <template v-if="item.langKey">
          {{ $t(item.langKey) }}
        </template>
        <template v-else>
          {{ item.dictLabel }}
        </template>
        <i v-if="showValue">#{{ item.dictValue }}</i>
      </el-tag>

      <span v-else :key="item.dictValue" :index="index" :class="item.cssClass">
        <template v-if="item.langKey">
          {{ $t(item.langKey) }}
        </template>
        <template v-else>
          {{ item.dictLabel }}
        </template>
        <i v-if="showValue">#{{ item.dictValue }}</i>
      </span>
    </template>
  </template>
</template>

<script setup>
const props = defineProps({
  // 数据
  options: {
    type: Array,
    default: null
  },
  // 当前的值
  value: [Number, String, Array, Boolean],
  showValue: false,
  split: {
    type: String,
    default: null
  },
  //自定义属性值 例如：{ label: 'name', value: 'id'}
  config: {
    type: Object,
    default: null
  }
})
const dataList = computed(() => {
  if (props.config) {
    let config = props.config
    var newList = []

    for (let d of props.options) {
      let label = d[config.label]
      let value = d[config.value]

      newList.push({ dictLabel: label, dictValue: value, ...d })
    }
    return newList
  }
  return props.options
})
const values = computed(() => {
  if (props.value !== null && typeof props.value !== 'undefined') {
    if (props.split != null && props.split != '') {
      return props.value.split(props.split) ?? []
    } else {
      return Array.isArray(props.value) ? props.value : [String(props.value)]
    }
  } else {
    return []
  }
})
const dictValues = ref(['primary', 'danger', 'warning', 'info', 'success'])
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
