<template>
  <div class="app-container">
    <!-- 顶部操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Check" :disabled="unreadTotal <= 0" @click="handleReadAll">全部已读</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['usermsg:delete']">删除</el-button>
      </el-col>
      <el-col :span="6">
        <span class="unread-tip">
          未读消息：
          <b>{{ unreadTotal }}</b> 条
        </span>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 筛选栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" class="mt10">
      <el-form-item label="消息类型" prop="msgType">
        <el-select v-model="queryParams.msgType" placeholder="全部" clearable style="width: 120px">
          <el-option label="系统" value="SYSTEM" />
          <el-option label="点赞" value="PRAISE" />
          <el-option label="评论" value="COMMENT" />
          <el-option label="租户通知" value="TENANT_NOTICE" />
        </el-select>
      </el-form-item>
      <el-form-item label="阅读状态" prop="isRead">
        <el-select v-model="queryParams.isRead" placeholder="全部" clearable style="width: 120px">
          <el-option label="未读" :value="0" />
          <el-option label="已读" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词" prop="keyWord">
        <el-input v-model="queryParams.keyWord" placeholder="消息内容" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 消息列表 -->
    <el-table v-loading="loading" :data="msgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="类型" align="center" width="100">
        <template #default="scope">
          <el-tag :type="msgTypeMeta[scope.row.msgType]?.type" effect="light">{{ msgTypeMeta[scope.row.msgType]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" prop="content" min-width="240" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link type="primary" underline="never" :class="{ 'read-title': row.isRead == 1 }" @click="handleView(row)">{{
            plainSummary(row.content)
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.isRead == 1 ? 'info' : 'danger'" effect="plain">
            {{ scope.row.isRead == 1 ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="addTime" width="170" sortable>
        <template #default="scope">
          {{ showTime(scope.row.addTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button text type="primary" icon="View" @click="handleView(scope.row)">详情</el-button>
          <el-button text type="primary" icon="CircleCheck" @click="handleRead(scope.row)" v-if="scope.row.isRead == 0"> 标记已读 </el-button>
          <el-button text icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无消息" />
      </template>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 系统消息详情 -->
    <el-dialog title="系统消息详情" v-model="open" width="700px" append-to-body>
      <div class="detail-content">{{ currentMsg.content || '-' }}</div>
      <template #footer>
        <el-button text @click="open = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserMsg">
import { listMySysUserMsg, unreadCount, readSysUserMsg, readAllSysUserMsg, delSysUserMsg } from '@/api/system/sysusermsg'
import { showTime } from '@/utils'
import { getCurrentInstance } from 'vue'
import useSocketStore from '@/store/modules/socket'

const { proxy } = getCurrentInstance()

const msgTypeMeta = {
  SYSTEM: { label: '系统', type: 'primary' },
  PRAISE: { label: '点赞', type: 'warning' },
  COMMENT: { label: '评论', type: 'success' },
  TENANT_NOTICE: { label: '租户通知', type: 'danger' }
}

const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const unreadTotal = ref(0)
const msgList = ref([])
const open = ref(false)
const currentMsg = ref({})

/**
 * 将 Markdown 文案转为列表展示用的单行纯文本摘要：
 * 去掉加粗符号、引用标记、列表符号与换行，避免列表里出现 **、-、> 等噪音。
 */
function plainSummary(md) {
  if (!md) return '-'
  return String(md)
    .replace(/^#+\s*/gm, '')
    .replace(/[*`>]/g, '')
    .replace(/^\s*[-]\s+/gm, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const data = reactive({
  queryParams: { pageNum: 1, pageSize: 10, msgType: undefined, isRead: '', keyWord: '', sort: 'msgId', sortType: 'desc' }
})
const { queryParams } = toRefs(data)

function getList() {
  loading.value = true
  const q = { ...queryParams.value }
  if (q.isRead === '') q.isRead = undefined
  listMySysUserMsg(q)
    .then((res) => {
      if (res.code === 200) {
        msgList.value = res.data.result || []
        total.value = res.data.totalNum || 0
      } else {
        msgList.value = []
        total.value = 0
      }
    })
    .finally(() => {
      loading.value = false
    })
  getUnread()
}

function getUnread() {
  unreadCount().then((res) => {
    unreadTotal.value = res.data ?? 0
    useSocketStore().setSysMsgNum(unreadTotal.value)
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  queryParams.value.msgType = undefined
  queryParams.value.isRead = ''
  queryParams.value.keyWord = ''
  getList()
}

function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.msgId)
  multiple.value = !selection.length
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
  proxy.$modal.confirm('确认将所有消息标记为已读？').then(() => {
    readAllSysUserMsg().then(() => {
      proxy.$modal.msgSuccess('已全部标记为已读')
      getList()
    })
  })
}

function handleDelete(row) {
  const msgIds = row.msgId || ids.value
  if (!msgIds || (Array.isArray(msgIds) && msgIds.length === 0)) return
  proxy.$modal
    .confirm('是否确认删除选中的消息？')
    .then(() => delSysUserMsg(msgIds))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

getList()
</script>

<style lang="scss" scoped>
.unread-tip {
  line-height: 28px;
  font-size: 13px;
  color: #909399;
}
.unread-tip b {
  color: #f56c6c;
}
.read-title {
  color: #c0c4cc;
}
.detail-content {
  max-height: 50vh;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  overflow-y: auto;
  white-space: pre-wrap;
}
</style>
