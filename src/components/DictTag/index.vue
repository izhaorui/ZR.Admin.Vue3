<template>
  <template v-for="(item, index) in props.options">
    <template v-if="values.includes(item.dictValue)">
      <span v-if="item.listClass == 'default' || item.listClass == ''" :key="item.dictValue" :index="index" :class="item.cssClass">
        {{ item.dictLabel }} <i v-if="showValue">#{{ item.dictValue }}</i>
      </span>
      <el-tag
        size="small"
        v-else
        :disable-transitions="true"
        :index="index"
        :type="item.listClass == 'primary' ? '' : item.listClass"
        :class="item.cssClass">
        {{ item.dictLabel }}
        <i v-if="showValue">#{{ item.dictValue }}</i>
      </el-tag>
    </template>
  </template>
</template>

<script setup>
const props = defineProps({
  // 数据
  options: {
    type: Array,
    default: null,
  },
  // 当前的值
  value: [Number, String, Array, Boolean],
  showValue: false,
})

const values = computed(() => {
  if (props.value !== null && typeof props.value !== 'undefined') {
    return Array.isArray(props.value) ? props.value : [String(props.value)]
  } else {
    return []
  }
})
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
