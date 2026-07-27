<!--
 * @Descripttion: (支付流水查询/oms_payment)
 * @Author: (admin)
 * @Date: (2026-07-26)
-->
<template>
  <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
    <el-form-item label="订单号" prop="orderNo">
      <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable />
    </el-form-item>
    <el-form-item label="支付方式" prop="payType">
      <el-select v-model="queryParams.payType" placeholder="全部" clearable style="width: 140px">
        <el-option v-for="item in dictStore.payTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="Number(item.dictValue)" />
      </el-select>
    </el-form-item>
    <el-form-item label="支付状态" prop="status">
      <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px">
        <el-option v-for="item in dictStore.paymentStatusOptions" :key="item.dictValue" :label="item.dictLabel" :value="Number(item.dictValue)" />
      </el-select>
    </el-form-item>
    <el-form-item label="渠道流水号" prop="channelTradeNo">
      <el-input v-model="queryParams.channelTradeNo" placeholder="微信/支付宝流水号" clearable />
    </el-form-item>
    <el-form-item label="创建时间">
      <el-date-picker
        v-model="dateRange"
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
    <el-table-column prop="id" label="流水Id" align="center" sortable v-if="columns.showColumn('id')" />
    <el-table-column prop="orderNo" label="订单号" align="center" v-if="columns.showColumn('orderNo')" show-overflow-tooltip />
    <el-table-column prop="payType" label="支付方式" align="center" width="110" v-if="columns.showColumn('payType')">
      <template #default="{ row }">
        <dict-tag :options="dictStore.payTypeOptions" :value="row.payType" />
      </template>
    </el-table-column>
    <el-table-column prop="channelTradeNo" label="渠道流水号" align="center" v-if="columns.showColumn('channelTradeNo')" show-overflow-tooltip />
    <el-table-column prop="amount" label="金额" align="center" v-if="columns.showColumn('amount')" />
    <el-table-column prop="status" label="支付状态" align="center" width="100" v-if="columns.showColumn('status')">
      <template #default="{ row }">
        <dict-tag :options="dictStore.paymentStatusOptions" :value="row.status" />
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="创建时间" align="center" width="160" v-if="columns.showColumn('createTime')" />
    <el-table-column prop="payTime" label="支付时间" align="center" width="160" v-if="columns.showColumn('payTime')" />
  </el-table>
  <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
</template>

<script setup name="Payment">
import { ref, reactive, computed } from 'vue'
import { listPayment } from '@/api/shopping/payment.js'
import { dayjs } from 'element-plus'
import useDictStore from '@/store/modules/dict'

const { proxy } = getCurrentInstance()
const dictStore = useDictStore()

const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'Id',
  sortType: 'desc',
  orderNo: undefined,
  payType: undefined,
  status: undefined,
  channelTradeNo: undefined
})
const columns = ref([
  { visible: true, align: 'center', type: '', prop: 'id', label: '流水Id' },
  { visible: true, align: 'center', type: '', prop: 'orderNo', label: '订单号' },
  { visible: true, align: 'center', type: 'dict', prop: 'payType', label: '支付方式' },
  { visible: true, align: 'center', type: '', prop: 'channelTradeNo', label: '渠道流水号' },
  { visible: true, align: 'center', type: '', prop: 'amount', label: '金额' },
  { visible: true, align: 'center', type: 'dict', prop: 'status', label: '支付状态' },
  { visible: true, align: 'center', type: '', prop: 'createTime', label: '创建时间' },
  { visible: true, align: 'center', type: '', prop: 'payTime', label: '支付时间' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])
const end = dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD') + ' 23:59:59'
const start = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD 00:00:00')
const dateRange = ref([start, end])

function getList() {
  proxy.addDateRange(queryParams, dateRange.value, 'CreateTime')
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
  getList()
}

function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

function sortChange(column) {
  queryParams.sort = column.prop && column.order ? column.prop : 'Id'
  queryParams.sortType = column.order
  handleQuery()
}

getList()
</script>
