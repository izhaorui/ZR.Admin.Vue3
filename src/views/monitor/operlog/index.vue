<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="系统模块" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入系统模块" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="operName">
        <el-input v-model="queryParams.operName" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="业务类型">
        <el-select v-model="queryParams.businessTypes" collapse-tags collapse-tags-tooltip multiple placeholder="操作类型" clearable>
          <template #header>
            <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll"> All </el-checkbox>
          </template>
          <el-option v-for="dict in options.sys_oper_type" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="操作状态" clearable>
          <el-option v-for="dict in options.sys_common_status" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求参数" prop="operParam">
        <el-input v-model="queryParams.operParam" placeholder="请输入请求参数" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="defaultTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          :shortcuts="dateOptions"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['monitor:operlog:remove']">
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="delete" @click="handleClean" v-hasPermi="['monitor:operlog:remove']">清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['system:operlog:export']">导出 </el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" :columns="columns" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="操作id" align="center" prop="operId" width="60px" :show-overflow-tooltip="true" v-if="columns.showColumn('operId')" />
      <el-table-column label="系统模块" align="center" prop="title" :show-overflow-tooltip="true" v-if="columns.showColumn('title')" />
      <el-table-column prop="businessType" label="业务类型" align="center" v-if="columns.showColumn('businessType')">
        <template #default="scope">
          <dict-tag :options="options.sys_oper_type" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <el-table-column label="请求方法" align="center" prop="requestMethod" v-if="columns.showColumn('requestMethod')" />
      <el-table-column label="操作人员" align="center" prop="operName" v-if="columns.showColumn('operName')" />

      <el-table-column label="操作地址" prop="operIp" width="120">
        <template #default="{ row }">
          <div>{{ row.operLocation }}</div>
          <div>{{ row.operIp }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作状态" align="center" prop="status" v-if="columns.showColumn('status')">
        <template #default="{ row }">
          <dict-tag :options="options.sys_common_status" :value="row.status"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column label="用时" align="center" prop="elapsed" v-if="columns.showColumn('elapsed')">
        <template #default="scope">
          <span :style="scope.row.elapsed < 1000 ? 'color:green' : scope.row.elapsed < 3000 ? 'color:orange' : 'color:red'">
            {{ scope.row.elapsed }} ms
          </span>
        </template>
      </el-table-column>
      <el-table-column label="日志内容" prop="errorMsg" width="220" v-if="columns.showColumn('errorMsg')" />
      <el-table-column label="操作日期" prop="operTime" width="100" v-if="columns.showColumn('operTime')">
        <template #default="scope">
          <span>{{ showTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="method" label="操作方法" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('method')" />
      <el-table-column prop="operParam" label="请求参数" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('operParam')" />
      <el-table-column prop="jsonResult" label="返回结果" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('jsonResult')" />
      <el-table-column label="操作" align="center" width="130">
        <template #default="scope">
          <el-button size="small" text icon="view" @click="handleView(scope.row, scope.index)" v-hasPermi="['monitor:operlog:query']">
            详细
          </el-button>
          <el-button size="small" text icon="delete" @click="handleDelete(scope.row)" v-hasPermi="['monitor:operlog:remove']"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" v-model="open" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-row>
          <el-col :lg="12">
            <el-form-item label="操作模块：">{{ form.title }} </el-form-item>
            <el-form-item label="登录信息：">
              <el-tag>{{ form.operName }}</el-tag> {{ form.operIp }} / {{ form.operLocation }}
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="操作类型：">
              <dict-tag :options="options.sys_oper_type" :value="form.businessType" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="操作状态：">
              <dict-tag :options="options.sys_common_status" :value="form.status"></dict-tag>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :lg="24" v-if="form.operParam">
            <el-form-item label="请求参数：">
              <el-input type="textarea" rows="5" v-model="form.operParam"> </el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="24" v-if="form.jsonResult">
            <el-form-item label="返回结果：">
              <el-input type="textarea" rows="10" v-model="form.jsonResult"> </el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">
              <div class="text-danger">{{ form.errorMsg }}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button text @click="open = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="operlog">
import { list as listOperLog, delOperlog, cleanOperlog } from '@/api/monitor/operlog'
import { showTime } from '@/utils'
import dayjs from 'dayjs'
const { proxy } = getCurrentInstance()
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
// 是否显示弹出层
const open = ref(false)

// 日期范围
const dateRange = ref([dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD 23:59:59')])
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

const state = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined,
    operParam: undefined,
    businessTypes: []
  },
  options: {
    statusOptions: [],
    //业务类型（0其它 1新增 2修改 3删除）选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    sys_oper_type: []
  }
})
const columns = ref([
  { visible: false, prop: 'operId', label: '操作id' },
  { visible: true, prop: 'title', label: '系统模块' },
  { visible: true, prop: 'businessType', label: '业务类型' },
  { visible: true, prop: 'requestMethod', label: '请求方式' },
  // { visible: true, prop: 'operatorType', label: '操作类型' },
  { visible: true, prop: 'operName', label: '操作人员' },
  // { visible: true, prop: 'deptName', label: '部门' },
  // { visible: true, prop: 'operUrl', label: '请求地址' },
  // { visible: true, prop: 'operIP', label: '请求IP' },
  { visible: true, prop: 'status', label: '操作状态' },
  // { visible: true, prop: 'operLocation', label: '操作人地址' },
  { visible: true, prop: 'operTime', label: '操作时间' },
  { visible: false, prop: 'method', label: '操作方法' },
  { visible: false, prop: 'operParam', label: '请求参数' },
  { visible: false, prop: 'jsonResult', label: '返回结果' },
  { visible: true, prop: 'errorMsg', label: '日志内容' },
  { visible: false, prop: 'elapsed', label: '操作用时' }
])
const { form, queryParams, options } = toRefs(state)
var dictParams = [{ dictType: 'sys_oper_type' }, { dictType: 'sys_common_status' }]
proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    state.options[element.dictType] = element.list
  })
})
/** 查询登录日志 */
function getList() {
  loading.value = true
  listOperLog(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
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

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  state.queryParams.businessTypes = []
  proxy.resetForm('queryForm')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.operId)
  multiple.value = !selection.length
}
const formRef = ref()
/** 重置操作表单 */
function reset() {
  form.value = {
    operId: undefined,
    title: undefined,
    businessType: undefined,
    method: undefined,
    requestMethod: undefined,
    operatorType: undefined,
    deptName: undefined,
    operUrl: undefined,
    operIp: undefined,
    operLocation: undefined,
    operParam: undefined,
    jsonResult: undefined,
    status: 0,
    errorMsg: undefined,
    operTime: undefined,
    elapsed: 0
  }
  proxy.resetForm('formRef')
}
/** 详细按钮操作 */
function handleView(row) {
  reset()
  open.value = true
  form.value = row
}
/** 删除按钮操作 */
function handleDelete(row) {
  const operIds = row.operId || ids.value
  proxy
    .$confirm('是否确认删除日志编号为"' + operIds + '"的数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return delOperlog(operIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
/** 清空按钮操作 */
function handleClean() {
  proxy
    .$confirm('是否确认清空所有操作日志数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return cleanOperlog()
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('清空成功')
    })
}
/** 导出按钮操作 */
function handleExport() {
  proxy
    .$confirm('是否确认导出所有操作日志?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await proxy.downFile('/monitor/OperLog/export', { ...queryParams.value })
    })
}
const checkAll = ref(false)
const indeterminate = ref(false)
/**
 *
 * @param {*} row
 */
function handleCheckAll(val) {
  indeterminate.value = false
  if (val) {
    queryParams.value.businessTypes = options.value.sys_oper_type.map((_) => _.dictValue)
  } else {
    queryParams.value.businessTypes = []
  }
}
watch(
  () => queryParams.value.businessTypes,
  (val) => {
    if (val.length === 0) {
      checkAll.value = false
      indeterminate.value = false
    } else if (val.length === options.value.sys_oper_type.length) {
      checkAll.value = true
      indeterminate.value = false
    } else {
      indeterminate.value = true
    }
  }
)
handleQuery()
</script>
