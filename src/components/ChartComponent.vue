<template>
  <div class="chart" ref="chartRef"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { echarts } from '@/utils/echarts'

const chartRef = ref(null)
let chartInstance = null

const chartOptions = {
  title: {
    text: 'Demo ECharts Data', // 文字属性设置
    textStyle: {
      color: '#00e4ff'
    }
  },
  tooltip: {},
  xAxis: {
    type: 'category',
    data: ['January', 'February', 'March', 'April', 'May', 'June', 'July']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Demo Data',
      type: 'bar',
      data: [65, 59, 80, 81, 56, 55, 40]
    }
  ]
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption(chartOptions)
    window.addEventListener('resize', resizeChart)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
  border: 1px solid #ddd;
}
</style>
