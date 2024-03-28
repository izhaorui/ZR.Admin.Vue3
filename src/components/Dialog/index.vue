<template>
  <el-dialog v-bind="$attrs" :fullscreen="isFullscreen" ref="myDialogRef" v-model="open">
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
  fullScreen: {
    type: Boolean,
    default: false
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

function handleScreen() {
  isFullscreen.value = !isFullscreen.value
}
const expose = {}
const myDialogRef = ref()
onMounted(() => {
  const entries = Object.entries(myDialogRef.value)
  for (const [method, fn] of entries) {
    expose[method] = fn
  }
})
defineExpose(expose)
</script>
<style>
.custom-header {
  position: relative;
}
.fullscreen {
  position: absolute;
  right: 8px;
  top: 0;
  cursor: pointer;
  width: 27px;
  height: 27px;
  text-align: center;
}
</style>
