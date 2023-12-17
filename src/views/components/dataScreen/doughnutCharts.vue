<template>
  <div class="echarts" ref="chartsRef" />
</template>
<script setup>
import * as echarts from 'echarts'
const chartsRef = ref(null)

const options = {
  tooltip: {
    trigger: 'item'
  },
  title: {
    text: '数据来源',
    // 文字属性设置
    textStyle: {
      color: '#00e4ff'
    }
  },
  legend: {
    top: '5%',
    left: 'center',
    // 文字属性设置
    textStyle: {
      color: '#fff'
    },
    // 图形属性设置
    itemStyle: {}
  },
  series: [
    {
      name: '访问来源',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: '搜索引擎' },
        { value: 735, name: '直接访问' },
        { value: 580, name: '电子邮件' },
        { value: 484, name: '其他' },
        { value: 300, name: '广告点击' }
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
