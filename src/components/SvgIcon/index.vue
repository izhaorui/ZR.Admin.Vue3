<script>
import { h, resolveComponent } from 'vue'

export default defineComponent({
  props: {
    // svg 图标组件名字
    name: {
      type: String,
      required: true,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    // svg 颜色
    color: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    if (props.name?.startsWith('ele')) {
      return () =>
        h(
          'i',
          {
            class: 'el-icon',
          },
          [h(resolveComponent(props.name.replace('ele-', '')))],
        )
    } else if (props.name != undefined && props.name != '') {
      return () =>
        h(
          'svg',
          {
            name: props.name,
            'aria-hidden': true,
            style: `color: ${props.color}`,
            class: `svg-icon ${props.className}`,
          },
          h('use', {
            'xlink:href': `#icon-${props.name}`,
            fill: `${props.color}`,
          }),
        )
    } else {
      return () => h('i')
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
