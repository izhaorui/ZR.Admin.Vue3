<!--
 * @Descripttion: (短信验证码记录/smsCode_log)
 * @Author: (zz)
 * @Date: (2023-11-19)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="用户id" prop="userid">
        <el-input v-model.number="queryParams.userid" placeholder="请输入用户id" />
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNum">
        <el-input v-model.number="queryParams.phoneNum" placeholder="请输入手机号" />
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
      <el-form-item label="发送类型" prop="sendType">
        <el-select clearable v-model="queryParams.sendType" placeholder="请选择发送类型">
          <el-option v-for="item in options.sendTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
            <span class="fl">{{ item.dictLabel }}</span>
            <span class="fr" style="color: var(--el-text-color-secondary)">{{ item.dictValue }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['smscodelog:export']">
          {{ $t('btn.export') }}
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
      @sort-change="sortChange">
      <el-table-column prop="id" label="Id" align="center" width="170" v-if="columns.showColumn('id')" />
      <el-table-column prop="userid" label="用户id" align="center" v-if="columns.showColumn('userid')" />
      <el-table-column prop="userIP" label="用户IP" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('userIP')" />
      <el-table-column prop="location" label="位置" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('userIP')" />
      <el-table-column prop="phoneNum" label="手机号" align="center" v-if="columns.showColumn('phoneNum')" />
      <el-table-column prop="smsCode" label="短信验证码" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('smsCode')" />
      <el-table-column prop="smsContent" label="短信内容" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('smsContent')" />
      <el-table-column prop="addTime" label="发送时间" :show-overflow-tooltip="true" v-if="columns.showColumn('addTime')" />
      <el-table-column prop="sendType" label="发送类型" align="center" v-if="columns.showColumn('sendType')">
        <template #default="scope">
          <dict-tag :options="options.sendTypeOptions" :value="scope.row.sendType" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60">
        <template #default="scope">
          <el-button
            type="danger"
            size="small"
            icon="delete"
            title="删除"
            v-hasPermi="['smscodelog:delete']"
            @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="smscodelog">
import { listSmscodeLog, delSmscodeLog } from '@/api/system/smscodelog.js'
const { proxy } = getCurrentInstance()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'Id',
  sortType: 'desc',
  userid: undefined,
  phoneNum: undefined,
  addTime: undefined,
  sendType: undefined
})
const columns = ref([
  { visible: true, prop: 'id', label: 'Id' },
  { visible: true, prop: 'smsCode', label: '短信验证码' },
  { visible: true, prop: 'userid', label: '用户id' },
  { visible: true, prop: 'phoneNum', label: '手机号' },
  { visible: true, prop: 'smsContent', label: '短信内容' },
  { visible: true, prop: 'addTime', label: '发送时间' },
  { visible: true, prop: 'userIP', label: '用户IP' },
  { visible: true, prop: 'sendType', label: '发送类型' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

// 添加时间时间范围
const dateRangeAddTime = ref([])

var dictParams = []

function getList() {
  proxy.addDateRange(queryParams, dateRangeAddTime.value, 'AddTime')
  loading.value = true
  listSmscodeLog(queryParams).then((res) => {
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
  // 添加时间时间范围
  dateRangeAddTime.value = []
  proxy.resetForm('queryRef')
  handleQuery()
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

const state = reactive({
  single: true,
  multiple: true,
  form: {},
  options: {
    // 发送类型 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    sendTypeOptions: [
      { dictLabel: '登录', dictValue: '0' },
      { dictLabel: '绑定', dictValue: '1' }
    ]
  }
})

const { form, options } = toRefs(state)

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？')
    .then(function () {
      return delSmscodeLog(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出短信验证码记录数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await proxy.downFile('/system/SmscodeLog/export', { ...queryParams })
    })
}

handleQuery()
</script>
