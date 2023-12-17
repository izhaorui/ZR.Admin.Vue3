<template>
  <div class="echarts" ref="chartsRef" />
</template>
<script setup>
import * as echarts from 'echarts'
const chartsRef = ref(null)

const options = {
  title: {
    text: '在线人数统计',
    // 文字属性设置
    textStyle: {
      color: '#00e4ff'
    }
  },
  grid: {
    top: '10%',
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    },
    padding: [5, 10]
  },
  yAxis: {
    // 设置坐标轴的 文字样式
    axisLabel: {
      color: '#bbdaff',
      margin: 20 // 刻度标签与轴线之间的距离。
    },
    // 坐标轴轴线相关设置。
    splitLine: {
      lineStyle: {
        color: '#fff'
      }
    }
  },
  xAxis: {
    splitLine: {
      show: false
    },
    // 坐标轴轴线相关设置。
    axisLine: {
      lineStyle: {
        color: 'orange'
      }
    },
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLabel: {
      // 设置坐标轴的 文字样式
      color: '#bbdaff',
      margin: 20 // 刻度标签与轴线之间的距离。
    },
    boundaryGap: false, // 设置坐标轴两边的留白 ，从刻度原点开始，
    axisTick: {
      // 取消坐标轴刻度线
      show: false
    }
  },
  series: [
    {
      name: '在线人数',
      itemStyle: {
        color: 'orange',
        lineStyle: {
          color: '#FF005A',
          width: 2
        }
      },
      symbol: 'circle',
      markLine: {
        silent: true
      },
      type: 'line',
      data: [154, 230, 224, 218, 135, 147, 260],
      animationDuration: 2800,
      animationEasing: 'cubicInOut'
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
