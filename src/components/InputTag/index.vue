<template>
  <div class="flex gap-2">
    <el-tag v-for="tag in dynamicTags" :key="tag" class="mr10" closable :disable-transitions="false" @close="handleClose(tag)">
      {{ tag }}
    </el-tag>
    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      :style="'width: ' + inputWidth"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm" />
    <el-button v-if="!inputVisible" text icon="plus" size="small" @click="showInput">
      <slot name="btn"> 新增 </slot>
    </el-button>
  </div>
</template>
<script setup>
import { isEmpty } from '@/utils/ruoyi'
const props = defineProps({
  modelValue: {
    type: [Array],
    default: []
  },
  inputWidth: {
    type: [String],
    default: '110px'
  }
})
const { proxy } = getCurrentInstance()
const emit = defineEmits()

const inputValue = ref('')
const dynamicTags = ref([])
const inputVisible = ref(false)
const InputRef = ref()

watch(
  () => props.modelValue,
  (val) => {
    dynamicTags.value = val ?? []
  },
  { deep: true, immediate: true }
)

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
  emit('update:modelValue', dynamicTags.value)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    proxy.$refs.InputRef.focus()
  })
}

const handleInputConfirm = () => {
  if (!isEmpty(inputValue.value.trim())) {
    dynamicTags.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
  emit('update:modelValue', dynamicTags.value)
}

defineExpose({
  showInput
})
</script>
