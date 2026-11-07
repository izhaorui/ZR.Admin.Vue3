<template>
  <div class="echarts" ref="chartsRef" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { echarts } from '@/utils/echarts'

const chartsRef = ref(null)
let chart = null

const options = {
  title: {
    text: '业务总览趋势',
    left: 'center',
    textStyle: {
      color: '#00e4ff',
      fontSize: 18
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    top: 30,
    textStyle: {
      color: '#bbdaff'
    },
    data: ['订单数', '销售额(万)', '访问量']
  },
  grid: {
    top: 70,
    left: '3%',
    right: '3%',
    bottom: 30,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: {
      lineStyle: {
        color: '#3c6fff'
      }
    },
    axisLabel: {
      color: '#bbdaff'
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '订单 / PV',
      axisLabel: {
        color: '#bbdaff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)'
        }
      }
    },
    {
      type: 'value',
      name: '销售额(万)',
      axisLabel: {
        color: '#bbdaff'
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '订单数',
      type: 'bar',
      barWidth: 12,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#00e4ff' },
          { offset: 1, color: '#0066ff' }
        ])
      },
      data: [320, 402, 391, 434, 590, 530, 620, 712, 680, 720, 760, 810]
    },
    {
      name: '销售额(万)',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: '#ffb400'
      },
      lineStyle: {
        width: 2,
        color: '#ffb400'
      },
      areaStyle: {
        color: 'rgba(255, 180, 0, 0.15)'
      },
      data: [45, 52, 48, 60, 72, 68, 80, 88, 90, 96, 102, 110]
    },
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: '#00ff9d'
      },
      data: [1200, 1500, 1800, 2200, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000]
    }
  ]
}

const initChart = () => {
  if (!chartsRef.value) return
  chart = echarts.init(chartsRef.value)
  chart.setOption(options)
}

const resizeHandler = () => {
  chart && chart.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped lang="scss">
.echarts {
  width: 100%;
  height: 100%;
}
</style>
