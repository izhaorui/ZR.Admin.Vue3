<template>
  <div>
    <ImagePreviewList
      ref="previewListRef"
      :images="internalImages"
      :limit="props.limit"
      :width="realWidth"
      :height="realHeight"
      @open="openDialog"
      @remove="removeImage"
      @reorder="handleReorder" />
    <ImageLibraryDialog
      v-if="dialogLoaded"
      v-model="dialogVisible"
      :initial-selection="internalImages"
      :open-key="dialogOpenKey"
      :limit="props.limit"
      :file-size="props.fileSize"
      @confirm="confirmSelection" />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, ref, watch } from 'vue'
import ImagePreviewList from './components/ImagePreviewList.vue'

const ImageLibraryDialog = defineAsyncComponent(() => import('./components/ImageLibraryDialog.vue'))

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: () => []
  },
  limit: {
    type: Number,
    default: 1
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 5
  },
  width: {
    type: [Number, String],
    default: '80px'
  },
  height: {
    type: [Number, String],
    default: '80px'
  }
})

const emit = defineEmits(['update:modelValue'])

const normalizeImages = (value) => {
  if (!value || value === '') return []
  return Array.isArray(value) ? [...value].filter(Boolean) : String(value).split(',').filter(Boolean)
}

const internalImages = ref(normalizeImages(props.modelValue))
const dialogVisible = ref(false)
const dialogLoaded = ref(false)
const dialogOpenKey = ref(0)
const previewListRef = ref()
const realWidth = computed(() => (typeof props.width === 'string' ? props.width : `${props.width}px`))
const realHeight = computed(() => (typeof props.height === 'string' ? props.height : `${props.height}px`))

watch(
  () => props.modelValue,
  (value) => {
    const next = normalizeImages(value)
    const current = internalImages.value
    if (next.length === current.length && next.every((item, index) => item === current[index])) return
    internalImages.value = next
  }
)

const updateModelValue = (images) => {
  const next = [...images]
  internalImages.value = next
  emit('update:modelValue', next.join(','))
}

const openDialog = () => {
  dialogLoaded.value = true
  dialogOpenKey.value += 1
  dialogVisible.value = true
}

const confirmSelection = (images) => {
  updateModelValue(images)
  nextTick(() => {
    previewListRef.value?.refreshSortable()
  })
}

const handleReorder = (images) => {
  updateModelValue(images)
}

const removeImage = (url) => {
  updateModelValue(internalImages.value.filter((item) => item !== url))
}

// 供外部按钮打开素材库（例如富文本编辑器「从素材库插入图片」）
defineExpose({ openDialog })
</script>
