<template>
  <template v-for="(item, index) in props.options">
    <template v-if="values.includes(item.dictValue)">
      <span v-if="item.listClass == 'default' || item.listClass == ''" :key="item.dictValue" :index="index" :class="item.cssClass">
        <template v-if="item.langKey">
          {{ $t(item.langKey) }}
        </template>
        <template v-else>
          {{ item.dictLabel }}
        </template>
        <i v-if="showValue">#{{ item.dictValue }}</i>
      </span>
      <el-tag
        v-else
        size="small"
        :disable-transitions="true"
        :index="index"
        :type="item.listClass == 'primary' ? '' : item.listClass"
        :class="item.cssClass">
        <template v-if="item.langKey">
          {{ $t(item.langKey) }}
        </template>
        <template v-else>
          {{ item.dictLabel }}
        </template>
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
    default: null
  },
  // 当前的值
  value: [Number, String, Array, Boolean],
  showValue: false,
  split: {
    type: String,
    default: null
  }
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
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
