<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="消息状态" prop="isRead">
        <el-radio-group v-model="queryParams.isRead" placeholder="请选择状态" @change="handleQuery" clearable style="width: 180px">
          <el-radio-button label="全部" />
          <el-radio-button label="未读" :value="0" />
          <el-radio-button label="已读" :value="1" />
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Check" :disabled="unreadTotal <= 0" @click="handleReadAll">全部已读</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="msgList" border>
      <el-table-column label="消息内容" prop="content" min-width="420" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="handleView(scope.row)">{{ scope.row.content }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isRead == 1 ? 'success' : 'warning'">{{ scope.row.isRead == 1 ? '已读' : '未读' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="addTime" width="160" sortable>
        <template #default="scope">
          {{ showTime(scope.row.addTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140">
        <template #default="scope">
          <el-button text icon="View" @click="handleView(scope.row)">详情</el-button>
          <el-button text icon="Check" v-if="scope.row.isRead == 0" @click="handleRead(scope.row)">已读</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="系统消息详情" v-model="open" width="700px" append-to-body>
      <div class="detail-content">{{ currentMsg.content || '-' }}</div>
      <template #footer>
        <el-button text @click="open = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserMsg">
import { listMySysUserMsg, readSysUserMsg } from '@/api/system/sysusermsg'
import { showTime } from '@/utils'
import useSocketStore from '@/store/modules/socket'

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const unreadTotal = ref(0)
const msgList = ref([])
const open = ref(false)
const currentMsg = ref({})
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  msgType: 1,
  isRead: undefined,
  sort: 'msgId',
  sortType: 'desc'
})

function getList() {
  loading.value = true
  listMySysUserMsg(queryParams)
    .then((response) => {
      if (response.code === 200) {
        msgList.value = response.data.result || []
        total.value = response.data.totalNum || 0
      } else {
        msgList.value = []
        total.value = 0
      }
    })
    .finally(() => {
      loading.value = false
    })
  refreshUnreadTotal()
}

function refreshUnreadTotal() {
  listMySysUserMsg({ pageNum: 1, pageSize: 1, msgType: 1, isRead: 0 }).then((response) => {
    unreadTotal.value = response?.data?.totalNum || 0
    useSocketStore().setSysMsgNum(unreadTotal.value)
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryForm')
  queryParams.pageNum = 1
  queryParams.msgType = 1
  getList()
}

function handleView(row) {
  currentMsg.value = row
  open.value = true
  if (row.isRead == 0) {
    handleRead(row, false)
  }
}

function handleRead(row, showMessage = true) {
  readSysUserMsg(row.msgId, 1).then(() => {
    if (showMessage) {
      proxy.$modal.msgSuccess('已标记为已读')
    }
    getList()
  })
}

function handleReadAll() {
  proxy
    .$confirm('是否确认将所有系统消息标记为已读?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      return readSysUserMsg(0, 1)
    })
    .then(() => {
      proxy.$modal.msgSuccess('操作成功')
      getList()
    })
}

getList()
</script>

<style lang="scss" scoped>
.detail-content {
  max-height: 50vh;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  overflow-y: auto;
  white-space: pre-wrap;
}
</style>
