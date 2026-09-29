<!--
 * @Descripttion: (支付流水/oms_payment)
 * @Author: (admin)
 * @Date: (2026-07-26)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" style="width: 200px" />
      </el-form-item>
      <el-form-item label="支付类型" prop="payType">
        <el-select v-model="queryParams.payType" placeholder="请选择" clearable style="width: 140px">
          <el-option v-for="(label, val) in payTypeMap" :key="val" :label="label" :value="Number(val)" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 140px">
          <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="dateRange">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px" />
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
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
      <el-table-column prop="id" label="流水Id" align="center" v-if="columns.showColumn('id')" />
      <el-table-column prop="orderNo" label="订单号" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('orderNo')" />
      <el-table-column prop="payType" label="支付类型" align="center" v-if="columns.showColumn('payType')">
        <template #default="scope">{{ payTypeMap[scope.row.payType] || '未知' }}</template>
      </el-table-column>
      <el-table-column
        prop="channelTradeNo"
        label="渠道流水号"
        align="center"
        :show-overflow-tooltip="true"
        v-if="columns.showColumn('channelTradeNo')" />
      <el-table-column prop="amount" label="金额" align="center" v-if="columns.showColumn('amount')" />
      <el-table-column prop="status" label="状态" align="center" v-if="columns.showColumn('status')">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusMap[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" v-if="columns.showColumn('createTime')" />
      <el-table-column prop="payTime" label="支付时间" align="center" v-if="columns.showColumn('payTime')" />
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="scope">
          <el-button type="primary" link icon="view" @click="handleDetail(scope.row)" v-hasPermi="['oms:payment:list']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 详情：预支付凭证 + 回调原文 -->
    <el-drawer title="支付流水详情" v-model="detailOpen" size="55%" @close="detailClose">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="流水Id">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="支付类型">{{ payTypeMap[detail.payType] || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="渠道流水号">{{ detail.channelTradeNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ detail.amount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)">{{ statusMap[detail.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.payTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">预支付凭证 (PrepayData)</el-divider>
      <pre class="raw-box">{{ detail?.prepayData || '无' }}</pre>

      <el-divider content-position="left">回调原文 (CallbackRaw)</el-divider>
      <pre class="raw-box">{{ detail?.callbackRaw || '无' }}</pre>
    </el-drawer>
  </div>
</template>

<script setup name="payment">
import { listPayment, getPayment } from '@/api/shopping/payment.js'
const { proxy } = getCurrentInstance()
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: '',
  sortType: 'desc',
  orderNo: undefined,
  payType: undefined,
  status: undefined,
  beginCreateTime: undefined,
  endCreateTime: undefined
})
const dateRange = ref([])
const columns = ref([
  { visible: true, align: 'center', type: '', prop: 'id', label: '流水Id' },
  { visible: true, align: 'center', type: '', prop: 'orderNo', label: '订单号', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'payType', label: '支付类型' },
  { visible: true, align: 'center', type: '', prop: 'channelTradeNo', label: '渠道流水号', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'amount', label: '金额' },
  { visible: true, align: 'center', type: '', prop: 'status', label: '状态' },
  { visible: true, align: 'center', type: '', prop: 'createTime', label: '创建时间' },
  { visible: true, align: 'center', type: '', prop: 'payTime', label: '支付时间' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()

const payTypeMap = { 0: '模拟支付', 1: '微信H5', 2: '支付宝' }
const statusMap = { 0: '预支付', 1: '已支付', 2: '已关闭', 3: '已退款' }

function statusTagType(status) {
  const map = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger' }
  return map[status] || 'info'
}

function getList() {
  loading.value = true
  listPayment(queryParams).then((res) => {
    const { code, data } = res
    if (code == 200) {
      dataList.value = data.result
      total.value = data.totalNum
      loading.value = false
    }
  })
}

function handleQuery() {
  queryParams.pageNum = 1
  queryParams.beginCreateTime = undefined
  queryParams.endCreateTime = undefined
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.beginCreateTime = dateRange.value[0] + ' 00:00:00'
    queryParams.endCreateTime = dateRange.value[1] + ' 23:59:59'
  }
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  dateRange.value = []
  queryParams.orderNo = undefined
  queryParams.payType = undefined
  queryParams.status = undefined
  queryParams.beginCreateTime = undefined
  queryParams.endCreateTime = undefined
  handleQuery()
}

function sortChange(column) {
  if (column.prop != null && column.order != null) {
    queryParams.sort = column.prop
    queryParams.sortType = column.order
  } else {
    queryParams.sort = ''
    queryParams.sortType = 'desc'
  }
  handleQuery()
}

/*************** 详情 ***************/
const detailOpen = ref(false)
const detail = ref(null)
const logLoading = ref(false)

function handleDetail(row) {
  detail.value = null
  detailOpen.value = true
  logLoading.value = true
  getPayment(row.id).then((res) => {
    if (res.code == 200) {
      detail.value = res.data
    }
    logLoading.value = false
  })
}
function detailClose() {
  detail.value = null
}

handleQuery()
</script>

<style scoped>
.raw-box {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  max-height: 260px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  line-height: 1.6;
  color: #606266;
}
</style>
