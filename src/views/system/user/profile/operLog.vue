<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item>
        <el-date-picker
          v-model="dateRange"
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
          <dict-tag :options="options.sys_oper_type" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <!-- <el-table-column label="请求方式" align="center" prop="requestMethod" /> -->
      <el-table-column label="操作地点" align="center" prop="operLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" align="center" prop="status">
        <template #default="{ row }">
          <dict-tag :options="options.sys_common_status" :value="row.status"></dict-tag>
        </template>
      </el-table-column>

      <!-- <el-table-column label="日志内容" align="center" prop="errorMsg" :show-overflow-tooltip="true" /> -->
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
const { proxy } = getCurrentInstance()
// 遮罩层
const loading = ref(true)
// 总条数
const total = ref(0)
// 表格数据
const list = ref([])

// 日期范围
const dateRange = ref([])

const state = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined
  },
  options: {
    //业务类型（0其它 1新增 2修改 3删除）选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    sys_oper_type: [],
    sys_common_status: []
  }
})
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
  queryParams.value.operName = useUserStore().userInfo.userName
  queryLog(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
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
