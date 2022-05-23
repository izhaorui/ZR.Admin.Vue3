<template>
  <div ref="chartRef" :class="className" :style="{ height: height, width: width }" />
</template>

<script setup>
import * as echarts from 'echarts'

// import("echarts/theme/macarons"); // echarts theme
// import { debounce } from '@/utils'
import { useDebounceFn } from '@vueuse/core'

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
    default: () => [
      {
        value: '',
        name: '占比',
      },
    ],
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
        name: props.name,
        type: 'gauge',
        min: props.min,
        max: props.max,
        detail: {
          formatter: '{value}%',
        },
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
