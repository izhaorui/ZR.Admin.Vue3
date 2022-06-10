<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item>
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list">
      <!-- <el-table-column label="编号" align="center" prop="operId" width="60px" :show-overflow-tooltip="true" /> -->
      <el-table-column label="系统模块" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column prop="businessType" label="业务类型" align="center">
        <template #default="scope">
          <dict-tag :options="businessTypeOptions" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <el-table-column label="请求方式" align="center" prop="requestMethod" />
      <el-table-column label="操作地点" align="center" prop="operLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" align="center" prop="status">
        <template #default="{ row }">
          <dict-tag :options="statusOptions" :value="row.status"></dict-tag>
        </template>
      </el-table-column>

      <el-table-column label="日志内容" align="center" prop="errorMsg" :show-overflow-tooltip="true" />
      <el-table-column label="操作日期" align="center" prop="operTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.operTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="operlog">
import { list as queryLog } from '@/api/monitor/operlog'
import useUserStore from '@/store/modules/user'
// 遮罩层
const loading = ref(true)
// 总条数
const total = ref(0)
// 表格数据
const list = ref([])
// 类型数据字典
const statusOptions = ref([])
// 业务类型（0其它 1新增 2修改 3删除）选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
const businessTypeOptions = ref([])
// 日期范围
const dateRange = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  operName: undefined,
  businessType: undefined,
  status: undefined,
})

const { proxy } = getCurrentInstance()
var dictParams = [
  { dictType: 'sys_oper_type', columnName: 'businessTypeOptions' },
  { dictType: 'sys_common_status', columnName: 'statusOptions' },
]
proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    proxy[element.columnName] = element.list
  })
})

/** 查询登录日志 */
function getList() {
  loading.value = true
  queryParams.operName = useUserStore().userInfo.userName
  queryLog(proxy.addDateRange(queryParams, dateRange.value)).then((response) => {
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
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryForm')
  handleQuery()
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
getList()
</script>
