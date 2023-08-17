<template>
  <el-dialog
    :width="width"
    :title="title"
    :lock-scroll="false"
    v-model="open"
    :lockScroll="lockScroll"
    :fullscreen="isFullscreen"
    :draggable="draggable"
    @closed="close">
    <template #header="{ close, titleId, titleClass }">
      <div class="custom-header">
        <span :id="titleId" :class="titleClass">{{ title }}</span>
        <span class="fullscreen" @click="handleScreen()">
          <svg-icon :name="isFullscreen ? 'exit-fullscreen' : 'fullscreen'" />
        </span>
      </div>
    </template>

    <slot></slot>

    <template v-slot:footer>
      <slot name="footer"> </slot>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String
  },
  width: {
    type: [Number, String],
    default: 0
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  draggable: {
    type: Boolean,
    default: false
  },
  lockScroll: {
    type: Boolean,
    default: true
  }
})

const isFullscreen = ref(false)
const open = ref(false)
watch(
  () => props.modelValue,
  (val) => {
    open.value = val
  },
  { deep: true, immediate: true }
)
watch(
  () => props.fullScreen,
  (val) => {
    isFullscreen.value = val
  },
  { deep: true, immediate: true }
)

const emit = defineEmits()
function handleScreen() {
  isFullscreen.value = !isFullscreen.value
}
function close() {
  emit('close')
}
</script>
<style>
.custom-header {
  position: relative;
}
.fullscreen {
  position: absolute;
  right: 13px;
  top: 5px;
  cursor: pointer;
  width: 27px;
  height: 27px;
  text-align: center;
}
</style>
