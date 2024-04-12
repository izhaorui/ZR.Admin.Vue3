<!--
 * @Descripttion: (邮件发送记录/email_log)
 * @Author: (zz)
 * @Date: (2023-11-20)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="发送邮箱" prop="fromEmail">
        <el-input v-model="queryParams.fromEmail" placeholder="请输入发送邮箱" />
      </el-form-item>
      <el-form-item label="邮件主题" prop="subject">
        <el-input v-model="queryParams.subject" placeholder="请输入邮件主题" />
      </el-form-item>
      <el-form-item label="是否送出" prop="isSend">
        <el-radio-group v-model="queryParams.isSend">
          <el-radio label="全部" value=""></el-radio>
          <el-radio label="是" :value="1"></el-radio>
          <el-radio label="否" :value="0"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="发送时间">
        <el-date-picker
          v-model="dateRangeAddTime"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="defaultTime"
          :shortcuts="dateOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['tool:email:send']" plain icon="plus" @click="handleSendEmail"> 发送邮件 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" :disabled="multiple" v-hasPermi="['tool:email:send']" plain icon="upload" @click="handleSend">
          批量发送
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" v-hasPermi="['emaillog:delete']" plain icon="delete" @click="handleDelete">
          {{ $t('btn.delete') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table
      :data="dataList"
      v-loading="loading"
      ref="table"
      border
      header-cell-class-name="el-table-header-cell"
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="id" label="Id" align="center" v-if="columns.showColumn('id')" />
      <el-table-column prop="fromName" label="发送人" />
      <el-table-column prop="fromEmail" label="发送邮箱" :show-overflow-tooltip="true" v-if="columns.showColumn('fromEmail')" />
      <el-table-column prop="subject" label="邮件主题" :show-overflow-tooltip="true" v-if="columns.showColumn('subject')" />
      <el-table-column prop="toEmails" label="接收邮箱" :show-overflow-tooltip="true" v-if="columns.showColumn('toEmails')" />
      <el-table-column prop="emailContent" label="邮件内容" :show-overflow-tooltip="true" v-if="columns.showColumn('emailContent')" />
      <el-table-column prop="sendResult" label="发送结果" :show-overflow-tooltip="true" />
      <el-table-column prop="addTime" label="发送时间" :show-overflow-tooltip="true" v-if="columns.showColumn('addTime')" />
      <el-table-column prop="isSend" label="是否发送" align="center">
        <template #default="{ row }">
          <DictTag :options="options.isSendOptions" :value="row.isSend"></DictTag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" icon="view" text @click="handlePreview(scope.row)"> 预览 </el-button>

          <el-button type="danger" size="small" icon="delete" text v-hasPermi="['emaillog:delete']" @click="handleDelete(scope.row)">
            删除
          </el-button>
          <el-button
            type="primary"
            size="small"
            icon="upload"
            text
            v-hasPermi="['tool:email:send']"
            @click="handleSend(scope.row)"
            v-if="scope.row.isSend == 0">
            发送
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <zr-dialog title="预览" :lock-scroll="false" v-model="open" @close="cancel">
      <el-form ref="formRef" :model="form" label-width="100px">
        <div v-html="form.emailContent"></div>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
      </template>
    </zr-dialog>
  </div>
</template>

<script setup name="emaillog">
import { listEmailLog, sendEmail, delEmailLog } from '@/api/system/emaillog.js'
const { proxy } = getCurrentInstance()

const router = useRouter()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'id',
  sortType: 'desc',
  fromEmail: undefined,
  subject: undefined,
  addTime: undefined,
  isSend: ''
})
const columns = ref([
  { visible: false, prop: 'id', label: 'Id' },
  { visible: true, prop: 'fromEmail', label: '发送邮箱' },
  { visible: true, prop: 'subject', label: '邮件主题' },
  { visible: true, prop: 'toEmails', label: '接收邮箱' },
  { visible: false, prop: 'emailContent', label: '邮件内容' },
  { visible: true, prop: 'addTime', label: '发送时间' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

// 发送时间时间范围
const dateRangeAddTime = ref([])

function getList() {
  proxy.addDateRange(queryParams, dateRangeAddTime.value, 'AddTime')
  loading.value = true
  listEmailLog(queryParams).then((res) => {
    const { code, data } = res
    if (code == 200) {
      dataList.value = data.result
      total.value = data.totalNum
      loading.value = false
    }
  })
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  // 发送时间时间范围
  dateRangeAddTime.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
// 自定义排序
function sortChange(column) {
  var sort = undefined
  var sortType = undefined

  if (column.prop != null && column.order != null) {
    sort = column.prop
    sortType = column.order
  }
  queryParams.sort = sort
  queryParams.sortType = sortType
  handleQuery()
}

/*************** form操作 ***************/
const formRef = ref()

// 操作类型 1、add 2、edit 3、view
const opertype = ref(0)
const open = ref(false)
const state = reactive({
  single: true,
  multiple: true,
  form: {},
  rules: {
    id: [{ required: true, message: 'Id不能为空', trigger: 'blur' }]
  },
  options: {
    isSendOptions: [
      { dictLabel: '已送出', dictValue: '1', listClass: 'info' },
      { dictLabel: '未发送', dictValue: '0' }
    ]
  }
})

const { form, options, single, multiple } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
}

function handlePreview(row) {
  form.value = row
  open.value = true
}
function handleSendEmail() {
  router.push({
    name: 'sendemail'
  })
}

// 添加&修改 表单提交
function handleSend(row) {
  const Ids = row.id != undefined ? [row.id] : ids.value
  proxy.$modal.loading('发送中...')
  sendEmail({ idArr: Ids })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('发送成功')
    })
    .finally(() => {
      proxy.$modal.closeLoading()
    })
}

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？')
    .then(function () {
      return delEmailLog(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

handleQuery()
</script>
