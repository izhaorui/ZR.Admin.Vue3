<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="queryParams.ipaddr" placeholder="请输入登录地址" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="登录状态" clearable>
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:logininfor:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="delete" @click="handleClean" v-hasPermi="['monitor:logininfor:remove']">清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['system:logininfor:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="访问编号" align="center" prop="infoId" width="80" /> -->
      <el-table-column label="用户名称" align="center" prop="userName" width="100" />
      <el-table-column label="登录地址" align="center" prop="ipaddr" width="130">
        <template #default="{ row }">
          <div>{{ row.loginLocation }}</div>
          <div>{{ row.ipaddr }}</div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="登录地点" align="center" prop="loginLocation"  /> -->
      <el-table-column label="浏览器" prop="browser" />
      <el-table-column label="客户端id" prop="clientId" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" />
      <el-table-column label="操作状态" align="center" prop="status" width="90">
        <template #default="{ row }">
          <dict-tag :options="statusOptions" :value="row.status"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作信息" align="center" prop="msg" />
      <el-table-column label="登录日期" align="center" prop="loginTime" width="100">
        <template #default="scope">
          <span>{{ showTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button type="danger" text plain icon="delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="logininfor">
import { list as queryList, delLogininfor, cleanLogininfor, exportLogininfor } from '@/api/monitor/logininfor'
import { showTime } from '@/utils'
// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 表格数据
const list = ref([])
// 状态数据字典
const statusOptions = ref([])
// 日期范围
const dateRange = ref([])
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ipaddr: undefined,
  userName: undefined,
  status: undefined
})

const { proxy } = getCurrentInstance()
/** 查询登录日志列表 */
function getList() {
  loading.value = true
  queryList(proxy.addDateRange(queryParams, dateRange.value)).then((response) => {
    loading.value = false
    if (response.code == 200) {
      list.value = response.data.result
      total.value = response.data.totalNum
    } else {
      total.value = 0
      list.value = []
    }
  })
}
// 登录状态字典翻译
function statusFormat(row, column) {
  return proxy.selectDictLabel(statusOptions.value, row.status)
}
getList()
proxy.getDicts('sys_common_status').then((response) => {
  statusOptions.value = response.data
})

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryForm')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.infoId)
  multiple.value = !selection.length
}
/** 删除按钮操作 */
function handleDelete(row) {
  const infoIds = row.infoId || ids.value
  proxy
    .$confirm('是否确认删除访问编号为"' + infoIds + '"的数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return delLogininfor(infoIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
/** 清空按钮操作 */
function handleClean() {
  proxy
    .$confirm('是否确认清空所有登录日志数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return cleanLogininfor()
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('清空成功')
    })
}
/** 导出按钮操作 */
function handleExport() {
  proxy
    .$confirm('是否确认导出所有操作日志数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return exportLogininfor(queryParams)
    })
    .then((response) => {
      proxy.download(response.data.path)
    })
}
</script>
