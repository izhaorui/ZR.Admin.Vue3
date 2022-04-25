<template>
  <router-view />
</template>
<script setup>
const { proxy } = getCurrentInstance()
const token = computed(() => {
  return proxy.$store.getters.token
})

watch(
  token,
  (val) => {
    if (val) {
      proxy.signalr.start()
    }
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>
