<template>
  <div :style="'height:' + height">
    <div v-if="showLoading">加载中...</div>
    <iframe :id="iframeId" style="width: 100%; height: 100%" :src="src" ref="iframeRef" frameborder="no"></iframe>
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    default: '/'
  },
  iframeId: {
    type: String
  }
})
const showLoading = ref(true)
const height = ref(document.documentElement.clientHeight - 94.5 + 'px')
const iframeRef = ref(null)

onMounted(() => {
  if (iframeRef.value) {
    iframeRef.value.onload = () => {
      showLoading.value = false

      console.log('Iframe 加载完成')
    }
  }
})
</script>
