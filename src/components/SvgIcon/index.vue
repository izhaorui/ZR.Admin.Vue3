<template>
  <svg :class="svgClass" aria-hidden="true" v-if="iconType == 0">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
  <el-icon v-else><component :is="iconName" /></el-icon>
</template>

<script>
export default defineComponent({
  props: {
    iconClass: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return {
      iconType: computed(() => {
        if (props.iconClass.startsWith('ele')) {
          return 1
        } else {
          return 0
        }
      }),
      iconName: computed(() => {
        if (props.iconClass?.startsWith('ele-')) {
          return props.iconClass.replace('ele-', '')
        } else {
          return `#icon-${props.iconClass}`
        }
      }),
      svgClass: computed(() => {
        if (props.className) {
          return `svg-icon ${props.className}`
        }
        return 'svg-icon'
      }),
    }
  },
})
</script>

<style scope lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
