<template>
  <div class="dashboard-editor-container home">
    <!-- 用户信息 -->
    <el-row :gutter="15">
      <el-col :md="24" :lg="16" :xl="16" class="mb10">
        <el-card shadow="hover">
          <template #header>
            <span>{{ $t('layout.myWorkbench') }}</span>
          </template>
          <div class="user-item">
            <div class="user-item-left">
              <img :src="userInfo.avatar" />
            </div>

            <div class="user-item-right overflow">
              <el-row>
                <el-col :xs="24" :md="24" class="right-title mb20 one-text-overflow">
                  {{ userInfo.welcomeMessage + ',' + userInfo.nickName + ' ,' + userInfo.welcomeContent }}
                </el-col>
                <el-col :xs="24" :sm="24" :md="24">
                  <el-row>
                    <el-col :xs="24" :lg="8" class="right-l-v">
                      <div class="right-label">{{ $t('common.nickName') }}：</div>
                      <div class="right-value">{{ userInfo.nickName }}</div>
                    </el-col>
                    <el-col :xs="24" :lg="16" class="right-l-v">
                      <div class="right-label">身份：</div>
                      <div class="right-value">
                        <span v-for="item in userInfo.roles" :key="item.roleId">
                          {{ item.roleName }}
                        </span>
                      </div>
                    </el-col>
                  </el-row>
                </el-col>
                <el-col :md="24" class="mt10">
                  <el-row>
                    <el-col :xs="24" :sm="12" :md="8" class="right-l-v">
                      <div class="right-label one-text-overflow">IP：</div>
                      <div class="right-value one-text-overflow">
                        {{ userInfo.loginIP }}
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="12" :md="16" class="right-l-v">
                      <div class="right-label one-text-overflow">{{ $t('common.time') }}：</div>
                      <div class="right-value one-text-overflow">
                        {{ currentTime }}
                      </div>
                    </el-col>
                  </el-row>
                </el-col>
                <el-col :lg="24" class="mt10">
                  <el-button size="small" icon="edit">
                    <router-link to="/user/profile">{{ $t('layout.modifyInformation') }}</router-link>
                  </el-button>
                  <!-- <el-button size="small" icon="el-icon-position" type="primary">发布活动</el-button> -->
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :md="24" :lg="8" :xl="8" class="mb10">
        <el-card shadow="hover">
          <template #header>
            <div>
              <span>{{ $t('layout.onlineUsers') }}</span>
              <el-button class="home-card-more" text @click="onOpenGitee">{{ $t('btn.more') }}</el-button>
            </div>
          </template>
          <div class="info">
            <!-- <vue3-seamless-scroll :list="onlineUsers" class="info-scroll" :step="0.2" :limitScrollNum="1"> -->
            <el-scrollbar wrap-class="scrollbar-wrapper">
              <div class="info-scroll">
                <ul class="info-ul">
                  <li v-for="(v, k) in onlineUsers" :key="k" class="info-item">
                    <div class="info-item-left" v-text="v.name"></div>
                    <div>{{ v.userIP }}</div>
                    <div class="info-item-right" v-text="dayjs(v.loginTime).format('HH:mm:ss')"></div>
                  </li>
                </ul></div
            ></el-scrollbar>
            <!-- </vue3-seamless-scroll> -->
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
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="24">
        <div class="chart-wrapper">
          <WordCloudChat :data="data.wordCloud" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RaddarChart from './dashboard/RaddarChart'
import PieChart from './dashboard/PieChart'
import BarChart from './dashboard/BarChart'
import WordCloudChat from './dashboard/WordCloud.vue'
// import { Vue3SeamlessScroll } from 'vue3-seamless-scroll'

import dayjs from 'dayjs'

const data = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145],
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130],
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130],
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130],
  },
  wordCloud: [
    {
      name: 'Vue3',
      value: 1446,
    },
    {
      name: '.net6',
      value: 928,
    },
    {
      name: 'Sqlsugar',
      value: 906,
    },
    {
      name: 'Redis',
      value: 825,
    },
    {
      name: 'Lover Boy',
      value: 514,
    },
    {
      name: '开源免费',
      value: 486,
    },
    {
      name: '音乐',
      value: 53,
    },
    {
      name: '打赏',
      value: 163,
    },
    {
      name: '国际化',
      value: 163,
    },
    {
      name: 'Composition api',
      value: 1163,
    },
    {
      name: 'Quartz.Net',
      value: 1,
    },
  ],
}
const { proxy } = getCurrentInstance()
const userInfo = computed(() => {
  return proxy.$store.getters.userinfo
})
const currentTime = computed(() => {
  return proxy.parseTime(new Date())
})
const onlineUsers = computed(() => {
  return proxy.$store.getters.onlineUsers
})

let lineChartData = reactive([])
const dataType = ref(null)
function handleSetLineChartData(type) {
  dataType.value = type
  lineChartData = data[type]
}
handleSetLineChartData('newVisitis')
function onOpenGitee() {}
</script>

<style lang="scss" scoped>
.home {
  overflow: hidden;
  .home-card-more {
    float: right;
    padding: 3px 0;
    font-size: 13px;
  }

  .user-item {
    height: 198px;
    display: flex;
    align-items: center;
    .user-item-left {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .user-item-right {
      flex: 1;
      padding: 15px;
      .right-title {
        font-size: 20px;
      }
      .right-l-v {
        font-size: 13px;
        display: flex;
        .right-label {
          color: gray;
          width: 75px;
        }
        .right-value {
          flex: 1;
        }
      }
    }
  }
  .info {
    height: 189px;
    // overflow-y: scroll;
    .info-scroll {
      height: 100%;
      overflow: auto;
      .info-ul {
        list-style: none;
        padding: 0;
        .info-item {
          display: flex;
          font-size: 13px;
          color: gray;
          height: 28px;
          line-height: 28px;

          &:hover {
            color: var(--color-primary);
            cursor: pointer;
          }
          .info-item-left {
            flex: 1;
            flex-shrink: 0;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
          .info-item-right {
            width: 160px;
            text-align: right;
            padding-right: 10px;
          }
        }
      }
    }
  }
}
.dashboard-editor-container {
  background-color: var(--base-bg-main);
  position: relative;

  .chart-wrapper {
    background: var(--base-bg-main);
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
