<template>
  <div ref="chartRef" :class="className" :style="{ height: height, width: width }" />
</template>

<script setup>
import * as echarts from 'echarts'
let chart = null
const { proxy } = getCurrentInstance()
const animationDuration = 6000
const props = defineProps({
  className: {
    type: String,
    default: 'chart'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '300px'
  }
})
const xData = ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
const data = [79, 52, 200, 334, 390, 330, 220]
const color = ['#fa796f', '#54c1fb', '#ca6cd4', '#59dcc1', '#09a4ea', '#e98f4d', '#ea8e49']
const dataOptions = []

data.forEach((item, index) => {
  let obj = {
    value: data[index],
    itemStyle: {
      color: color[index]
    }
  }
  dataOptions.push(obj)
})

function initChart() {
  chart = echarts.init(proxy.$refs.chartRef, 'macarons')

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    title: {
      text: '销量统计',
      // 文字属性设置
      textStyle: {
        color: '#00e4ff'
      }
    },
    grid: {
      top: 60,
      left: '2%',
      right: '2%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: xData,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisTick: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '销量',
        type: 'bar',
        stack: 'vistors',
        barWidth: '40%',
        data: dataOptions,
        animationDuration,
        label: {
          show: true
        }
      }
    ]
  })
}
onMounted(() => {
  initChart()
})
</script>
