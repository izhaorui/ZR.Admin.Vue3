<template>
  <div>
    <svg-icon v-if="isFullscreen" name="exit-fullscreen" @click="toggle" />
		<svg-icon v-else name="ele-FullScreen" @click="toggle" />
  </div>
</template>

<script setup>
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, enter, exit, toggle } = useFullscreen()
</script>