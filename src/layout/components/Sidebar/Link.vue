<template>
  <component :is="type" v-bind="linkProps()">
    <slot />
  </component>
</template>

<script setup>
import { isExternal } from '@/utils/validate'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  data: {
    type: [Object]
  }
})

const isExt = computed(() => {
  const path = props.data?.path
  if (path && path.startsWith('/link')) {
    return true
  }
  return isExternal(props.to)
})

const type = computed(() => {
  if (isExt.value) {
    return 'a'
  }
  return 'router-link'
})

function linkProps() {
  if (isExt.value) {
    var path = props.to
    if (path.startsWith('/link')) {
      path = import.meta.env.VITE_APP_ROUTER_PREFIX + path
      path = path.replace('//', '/')
    }
    return {
      href: path,
      target: '_blank',
      rel: 'noopener'
    }
  }
  return {
    to: props.to
  }
}
</script>
