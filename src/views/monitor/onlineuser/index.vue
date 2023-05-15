<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">刷新</el-button>
        <!-- <el-button icon="Refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button> -->
      </el-form-item>
    </el-form>

    <el-table :data="onlineUsers" ref="tableRef" border highlight-current-row>
      <!-- <el-table-column prop="connnectionId" label="连接id"></el-table-column> -->
      <el-table-column label="No" type="index" width="50" align="center">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="用户名" align="center" />
      <el-table-column prop="userIP" label="用户IP" align="center" />
      <el-table-column prop="location" label="登录地点" align="center" />
      <el-table-column prop="browser" label="登录浏览器"></el-table-column>
      <el-table-column prop="loginTime" label="登录时间">
        <template #default="scope">
          {{ dayjs(scope.row.loginTime).format('MM/DD日HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140">
        <template #default="scope">
          <el-button text @click="onChat(scope.row)" icon="bell" v-hasRole="['admin']">通知</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      class="mt10"
      background
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script setup name="onlineuser">
import { listOnline } from '@/api/monitor/online'
import dayjs from 'dayjs'
import useSocketStore from '@/store/modules/socket'
const { proxy } = getCurrentInstance()

const queryRef = ref(null)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// const total = computed(() => {
//   return useSocketStore().onlineNum
// })
// const onlineUsers = computed(() => {
//   return useSocketStore().onlineUsers
// })
const onlineUsers = ref([])
const total = ref(0)
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
function getList() {
  // proxy.signalr.SR.invoke('GetOnlineUsers', queryParams.pageNum, queryParams.pageSize).catch(function (err) {
  //   console.error(err.toString())
  // })
  listOnline(queryParams).then((res) => {
    if (res.code == 200) {
      total.value = res.data.totalNum
      onlineUsers.value = res.data.result
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
      proxy.signalr.SR.invoke('SendMessage', item.connnectionId, item.name, value).catch(function (err) {
        console.error(err.toString())
      })
    })
    .catch(() => {})
}
function resetQuery() {}
</script>
