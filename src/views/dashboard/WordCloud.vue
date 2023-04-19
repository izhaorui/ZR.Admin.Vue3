<template>
  <div ref="chartRef" :class="className" :style="{ height: props.height, width: props.width }" />
</template>

<script setup>
import * as echarts from 'echarts'

import { useDebounceFn } from '@vueuse/core'
// import 'echarts-wordcloud'

const { proxy } = getCurrentInstance()

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  min: {
    type: [Object, Number],
    default: 0,
  },
  max: {
    type: [Object, Number],
    default: 0,
  },
  data: {
    type: Array,
    default: () => [{}],
  },
  className: {
    type: String,
    default: 'chart',
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '300px',
  },
})
let chart = null
const chartRef = ref()

//重绘图表函数
const resizeHandler = () => {
  chart.resize()
}
function initChart() {
  chart = echarts.init(proxy.$refs.chartRef, 'macarons')

  chart.setOption({
    tooltip: {
      formatter: '{a} <br/>{b} : {c}',
    },
    series: [
      {
        type: 'wordCloud',
        // shape这个属性虽然可配置，但是在词的数量不太多的时候，效果不明显，它会趋向于画一个椭圆
        shape: 'circle',
        gridSize: 1,
        sizeRange: [12, 55],
        rotationRange: [-45, 0, 45, 90],
        textStyle: {
          normal: {
            color: function () {
              return (
                'rgb(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ')'
              )
            },
          },
        },
        left: 'center',
        top: 'center',
        right: null,
        bottom: null,
        data: props.data,
      },
    ],
  })
}
const debouncedFn = useDebounceFn(() => {
  // do something
  resizeHandler()
}, 500)

document.addEventListener('resize', debouncedFn)

onMounted(() => {
  initChart()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedFn)
})
</script>
