<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">刷新</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button plain type="primary" @click="onLockAll()" icon="lock" v-hasPermi="['monitor:online:forceLogout']">全部强退</el-button>
      </el-col>
    </el-row>
    <el-table :data="onlineUsers" v-loading="loading" ref="tableRef" border highlight-current-row>
      <!-- <el-table-column prop="connnectionId" label="连接id"></el-table-column> -->
      <el-table-column label="No" type="index" width="50" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="用户名" align="center" />
      <el-table-column label="登录地点" prop="location" align="center"> </el-table-column>
      <el-table-column label="登录IP" prop="userIP" align="center"></el-table-column>
      <el-table-column prop="browser" label="登录浏览器" width="210"></el-table-column>
      <el-table-column prop="platform" label="登录平台" align="center"></el-table-column>
      <el-table-column prop="loginTime" label="登录时间" witdh="280px">
        <template #default="scope">
          {{ dayjs(scope.row.loginTime).format('MM/DD日HH:mm:ss') }}
          <div>在线时长：{{ scope.row.onlineTime }}分钟</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="scope">
          <el-button text @click="onChat(scope.row)" icon="bell" v-hasRole="['admin']">通知</el-button>
          <el-button text @click="onLock(scope.row)" icon="lock" v-hasPermi="['monitor:online:forceLogout']">强退</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="onlineuser">
import { listOnline, forceLogout, forceLogoutAll } from '@/api/monitor/online'
import dayjs from 'dayjs'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
const { proxy } = getCurrentInstance()
const queryRef = ref(null)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

const onlineNum = computed(() => {
  return useSocketStore().onlineNum
})

const loading = ref(false)
const onlineUsers = ref([])
const total = ref(0)
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
function getList() {
  loading.value = true
  listOnline(queryParams).then((res) => {
    if (res.code == 200) {
      total.value = res.data.totalNum
      onlineUsers.value = res.data.result
      setTimeout(() => {
        loading.value = false
      }, 200)
    }
  })
}
getList()

function onChat(item) {
  proxy
    .$prompt('请输入通知内容', '', {
      confirmButtonText: '发送',
      cancelButtonText: '取消',
      inputPattern: /\S/,
      inputErrorMessage: '消息内容不能为空'
    })
    .then(({ value }) => {
      proxy.signalr.SR.invoke('sendMessage', item.connnectionId, item.userid, value).catch(function (err) {
        console.error(err.toString())
      })
    })
    .catch(() => {})
}
function onLock(row) {
  proxy
    .$prompt('请输入强退原因', '', {
      confirmButtonText: '发送',
      cancelButtonText: '取消'
    })
    .then((val) => {
      forceLogout({ ...row, time: 10, reason: val.value, clientId: row.clientId }).then(() => {
        proxy.$modal.msgSuccess('强退成功')
      })
    })
}

// 批量强退
function onLockAll() {
  proxy
    .$prompt('请输入强退原因', '', {
      confirmButtonText: '发送',
      cancelButtonText: '取消'
    })
    .then((val) => {
      forceLogoutAll({ time: 10, reason: val.value }).then((res) => {
        proxy.$modal.msgSuccess('强退成功')
      })
    })
}
watch(
  onlineNum,
  () => {
    handleQuery()
  },
  {
    immediate: true
  }
)
</script>
