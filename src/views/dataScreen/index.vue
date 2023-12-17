<template>
  <full-screen-container>
    <starBackground></starBackground>
    <div class="m-data-screen">
      <div class="header">
        <div class="header-bg-title">大屏数据展示</div>
        <div class="date">{{ timeDate }} {{ hourTime }}</div>
      </div>
      <div class="center">
        <div class="item" v-for="item in dataList">
          <div class="item-icon item-icon1">
            <img src="@/assets/images/charts/circle-bg.png" class="circle-bg" />
          </div>
          <div class="item-right">
            <div class="item-right-inner">
              <div class="text-title">{{ item.title }}</div>
              <div class="text-number">
                <count-up :start-val="item.start" :loop="true" :end-val="item.value"></count-up>
              </div>
              <div class="text-der text-decenter-wrapr">
                <div class="statistic-footer">
                  <div class="footer-item">
                    <span>环比</span>
                    <span style="color: green">
                      16%
                      <el-icon>
                        <CaretTop />
                      </el-icon>
                    </span>

                    <span>同比</span>
                    <span style="color: red">
                      -16%
                      <el-icon>
                        <CaretBottom />
                      </el-icon>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="left">
          <div class="item-complex" style="margin-bottom: 20px">
            <line-charts width="100%" height="100%" />
          </div>
          <div class="item-complex">
            <bar-chart />
          </div>
        </div>
        <div class="middle">
          <div class="migration">
            <migrationCharts />
          </div>
        </div>
        <div class="right">
          <div class="item-complex" style="margin-bottom: 20px">
            <doughnutCharts />
          </div>
          <div class="item-complex">
            <simple-gauge></simple-gauge>
          </div>
        </div>
      </div>
    </div>
  </full-screen-container>
</template>
<script setup>
import CountUp from 'vue-countup-v3'
import FullScreenContainer from '@/views/components/dataScreen/full-screen-container.vue'
import BarChart from '@/views/dashboard/BarChart'
import LineCharts from '@/views/components/dataScreen/lineEcharts'
import simpleGauge from '@/views/components/dataScreen/simpleGauge.vue'
import doughnutCharts from '@/views/components/dataScreen/doughnutCharts.vue'
import migrationCharts from '@/views/components/dataScreen/migrationCharts'
import starBackground from '@/views/components/starBackground.vue'

const timeDate = ref()
const hourTime = ref()
const time1 = ref()
const getHour = () => {
  let date = new Date()
  let hour = date.getHours().toString().padStart(2, '00')
  let minute = date.getMinutes().toString().padStart(2, '00')
  let second = date.getSeconds().toString().padStart(2, '00')
  hourTime.value = `${hour}:${minute}:${second}`
  time1.value = setTimeout(() => {
    time1.value && clearTimeout(time1.value)
    getHour()
    changeData()
  }, 1000)
}

const getNowTime = () => {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  timeDate.value = `${year}年${month}月${day}日`
  getHour()
}
onMounted(() => {
  getNowTime()
})

onBeforeUnmount(() => {
  time1.value = null
})

const dataList = ref([
  { title: '在线用户', value: 1000, percent: 78.21, start: 0 },
  { title: '消息', value: 2000, percent: 78.21, start: 0 },
  { title: '销量', value: 2550, percent: 18.21, start: 0 },
  { title: '访问量', value: 700, percent: 18.21, start: 0 },
  { title: '订单', value: 1700, percent: 18.21, start: 0 }
])
function changeData() {
  dataList.value.forEach((ele) => {
    ele.start = ele.value
    ele.value = ele.value += 3
  })
}
</script>
<style lang="scss">
@import url(./index.scss);
</style>
