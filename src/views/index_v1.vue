<template>
  <div class="home">
    <!-- 用户信息 -->
    <el-row :gutter="15">
      <el-col :md="24" :lg="16" :xl="24" class="mb10">
        <el-card shadow="hover">
          <div class="user-item">
            <div class="user-item-left">
              <el-avatar :size="60" shape="circle" :src="userInfo.avatar" />
            </div>

            <div class="user-item-right">
              <el-row>
                <el-col :xs="24" :md="24" class="right-title mb20 one-text-overflow">
                  <div class="mb10">
                    {{ userInfo.welcomeMessage }} <strong>{{ userInfo.nickName }}</strong>
                    <span>({{ userInfo.welcomeContent }})</span>
                  </div>
                </el-col>
              </el-row>
              <el-row>
                <el-button icon="edit">
                  <router-link to="/user/profile">{{ $t('layout.modifyInformation') }}</router-link>
                </el-button>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" class="mb10">
        <el-card style="height: 100%">
          <div class="text-warning mb10">{{ currentTime }} {{ weekName }}</div>
          <div class="work-wrap">
            <el-statistic :title="$t('layout.workTime')" :formatter="workTimeFormatter" :value="onlineInfo.todayOnlineTime" />
            <el-statistic :title="$t('layout.onlineClientNum')" :value="onlineInfo.clientNum" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="15">
      <el-col :md="24" :lg="24" :xl="24" class="mb10">
        <el-card shadow="hover">
          <template #header>
            <span><svg-icon name="tool" /> {{ $t('layout.commonFuncs') }}</span>
            <div class="home-card-more">
              <el-button text @click="handleAdd()">{{ $t('btn.add') }}</el-button>
            </div>
          </template>
          <div>
            <el-scrollbar wrap-class="scrollbar-wrapper"> <CommonMenu v-model="showEdit"></CommonMenu></el-scrollbar>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="24">
        <div class="chart-wrapper">
          <line-chart :chart-data="lineChartData" :key="dataType" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>
    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="24">
        <div class="chart-wrapper">
          <WordCloudChat :data="data.wordCloud" />
        </div>
      </el-col>
    </el-row> -->
  </div>
</template>

<script setup name="index">
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RaddarChart from './dashboard/RaddarChart'
import PieChart from './dashboard/PieChart'
import BarChart from './dashboard/BarChart'
// import WordCloudChat from './dashboard/WordCloud.vue'
import CommonMenu from './components/CommonMenu'
import dayjs from 'dayjs'
// 时间插件
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

import useUserStore from '@/store/modules/user'
import useSocketStore from '@/store/modules/socket'
import { getWeek } from '@/utils/ruoyi'
const showEdit = ref(false)
const data = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}
const { proxy } = getCurrentInstance()
const userInfo = computed(() => {
  return useUserStore().userInfo
})
const onlineInfo = computed(() => {
  return useSocketStore().onlineInfo
})
const currentTime = computed(() => {
  return proxy.parseTime(new Date(), 'YYYY-MM-DD')
})
const weekName = getWeek()

let lineChartData = reactive([])
const dataType = ref(null)
function handleSetLineChartData(type) {
  dataType.value = type
  lineChartData = data[type]
}
handleSetLineChartData('newVisitis')

function handleAdd() {
  proxy.$modal.msg('请通过搜索添加')
}
function workTimeFormatter(val) {
  return dayjs.duration(val * 60, 'second').format('HH时mm分')
}
</script>

<style lang="scss" scoped>
.home {
  .home-card-more {
    float: right;
    padding: 3px 0;
    font-size: 13px;
  }

  .user-item {
    // height: 198px;
    display: flex;
    align-items: center;
    .user-item-left {
      width: 60px;
      height: 60px;
      overflow: hidden;
      margin-right: 10px;
    }
    .user-item-right {
      flex: 1;
      .right-title {
        font-size: 20px;
      }
    }
  }
  .info {
    height: 200px;
    // overflow-y: scroll;
  }

  .work-wrap {
    display: grid;
    grid-template-columns: repeat(2, 50%);

    .item {
      text-align: center;

      .name {
        color: #606666;
      }
    }
  }
}
.chart-wrapper {
  background: var(--base-bg-main);
  padding: 16px 16px 0;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
