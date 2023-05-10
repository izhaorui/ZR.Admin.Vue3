<template>
  <div class="home">
    <!-- 用户信息 -->
    <el-row :gutter="15">
      <el-col :md="24" :lg="24" :xl="24" class="mb10">
        <el-card shadow="hover">
          <div class="user-item">
            <div class="user-item-left">
              <img :src="userInfo.avatar" />
            </div>

            <div class="user-item-right">
              <el-row>
                <el-col :xs="24" :md="24" class="right-title mb20 one-text-overflow">
                  {{ userInfo.welcomeMessage }} <strong>{{ userInfo.nickName }}</strong> {{ userInfo.welcomeContent }}
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
    </el-row>

    <el-row :gutter="15">
      <el-col :md="12" :lg="12" :xl="12" class="mb10" v-hasPermi="['online']">
        <el-card shadow="hover">
          <template #header>
            <div>
              <span><svg-icon name="peoples" />{{ $t('layout.onlineUsers') }}</span>
              <el-button class="home-card-more" text @click="onOpenGitee">{{ $t('btn.more') }}</el-button>
            </div>
          </template>
          <div class="info">
            <el-scrollbar wrap-class="scrollbar-wrapper">
              <div v-for="(v, k) in onlineUsers" :key="k" class="info-item">
                <div class="info-item-left" v-text="v.name"></div>
                <div>{{ v.userIP }}({{ v.location }})</div>
                <div class="info-item-right" v-text="dayjs(v.loginTime).format('MM/DD日HH:mm:ss')"></div>
                <el-button text @click="onChat(v)" icon="bell" v-hasRole="['admin']">通知</el-button>
              </div>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>
      <el-col :md="12" :lg="12" :xl="12" class="mb10">
        <el-card shadow="hover">
          <template #header>
            <span><svg-icon name="tool" /> 常用功能</span>
            <div class="home-card-more">
              <el-button text @click="handleAdd()">{{ $t('btn.add') }}</el-button>
              <!-- <el-button text @click="showEdit = !showEdit">
                <span v-if="!showEdit">{{ $t('btn.edit') }}</span>
                <span v-else>{{ $t('btn.cancel') }}</span>
              </el-button> -->
            </div>
          </template>
          <div class="info">
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

import useUserStore from '@/store/modules/user'
import useSocketStore from '@/store/modules/socket'
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
  },
  wordCloud: [
    {
      name: 'Vue3',
      value: 144
    },
    {
      name: '.net6',
      value: 928
    },
    {
      name: 'Sqlsugar',
      value: 906
    },
    {
      name: 'Redis',
      value: 825
    },
    {
      name: '代码生成',
      value: 514
    },
    {
      name: '开源免费',
      value: 486
    },
    {
      name: '代码简单',
      value: 53
    },
    {
      name: '打赏',
      value: 163
    },
    {
      name: '国际化',
      value: 163
    },
    {
      name: 'Composition api',
      value: 1163
    },
    {
      name: 'Quartz.Net',
      value: 190
    },
    {
      name: 'Element UI',
      value: 190
    }
  ]
}
const { proxy } = getCurrentInstance()
const userInfo = computed(() => {
  return useUserStore().userInfo
})
const currentTime = computed(() => {
  return proxy.parseTime(new Date())
})
const onlineUsers = computed(() => {
  return useSocketStore().onlineUsers
})

let lineChartData = reactive([])
const dataType = ref(null)
function handleSetLineChartData(type) {
  dataType.value = type
  lineChartData = data[type]
}
handleSetLineChartData('newVisitis')
function onOpenGitee() {}
function onChat(item) {
  proxy
    .$prompt('请输入通知内容', '', {
      confirmButtonText: '发送',
      cancelButtonText: '取消',
      inputPattern: /\S/,
      inputErrorMessage: '消息内容不能为空'
    })
    .then(({ value }) => {
      proxy.signalr.SR.invoke('SendMessage', item.connnectionId, item.name, value).catch(function (err) {
        console.error(err.toString())
      })
    })
    .catch(() => {})
}
function handleAdd() {
  proxy.$modal.msg('请通过搜索添加')
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
      border-radius: 50%;
      overflow: hidden;
      margin-right: 10px;
      img {
        width: 100%;
        height: 100%;
      }
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
        margin-right: 10px;
      }
      .info-item-right {
        width: 140px;
        text-align: right;
        padding-right: 10px;
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
