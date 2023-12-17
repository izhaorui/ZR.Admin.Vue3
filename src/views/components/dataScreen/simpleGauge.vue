<template>
  <div class="echarts" ref="chartsRef" />
</template>
<script setup>
import * as echarts from 'echarts'
const chartsRef = ref(null)

const options = {
  tooltip: {
    formatter: '{a} <br/>{b} : {c}%'
  },
  title: {
    text: '空气指标',
    // 文字属性设置
    textStyle: {
      color: '#00e4ff'
    }
  },
  series: [
    {
      name: 'Pressure',
      type: 'gauge',
      progress: {
        show: true
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}'
      },
      data: [
        {
          value: 50,
          name: 'SCORE'
        }
      ]
    }
  ]
}

let chart = null
const initChart = () => {
  const chart = echarts.init(chartsRef.value)
  chart.setOption(options)
  return chart
}
onMounted(() => {
  chart = initChart()
  window.addEventListener('resize', function () {
    chart && chart.resize()
  })
})
</script>
<style lang="scss" scoped>
.echarts {
  height: 100%;
  width: 100%;
}
</style>
