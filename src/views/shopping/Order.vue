<!--
 * @Descripttion: (订单管理/oms_order)
 * @Author: (admin)
 * @Date: (2026-07-26)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" style="width: 200px" />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="请选择状态" clearable style="width: 160px">
          <el-option v-for="(label, val) in orderStatusMap" :key="val" :label="label" :value="Number(val)" />
        </el-select>
      </el-form-item>
      <el-form-item label="会员ID" prop="memberId">
        <el-input v-model="queryParams.memberId" placeholder="按会员ID查询" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item label="下单时间" prop="dateRange">
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
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['oms:order:export']">
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
      <el-table-column prop="orderNo" label="订单号" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('orderNo')" />
      <el-table-column prop="user" label="收货人" align="center" v-if="columns.showColumn('user')">
        <template #default="scope">
          {{ (scope.row.addressSnapshot && scope.row.addressSnapshot.userName) || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="memberId" label="下单身份" align="center" v-if="columns.showColumn('memberId')">
        <template #default="scope">
          <el-tag v-if="scope.row.memberId" type="success" effect="plain">会员 {{ scope.row.memberId }}</el-tag>
          <el-tag v-else type="info" effect="plain">游客</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="总金额" align="center" v-if="columns.showColumn('totalAmount')" />
      <el-table-column prop="payAmount" label="实付金额" align="center" v-if="columns.showColumn('payAmount')" />
      <el-table-column prop="orderStatusLabel" label="状态" align="center" v-if="columns.showColumn('orderStatusLabel')">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.orderStatus)">{{ scope.row.orderStatusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="payType" label="支付方式" align="center" v-if="columns.showColumn('payType')">
        <template #default="scope">
          {{ payTypeMap[scope.row.payType] || '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="deliveryNo" label="物流单号" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('deliveryNo')" />
      <el-table-column prop="createTime" label="下单时间" align="center" v-if="columns.showColumn('createTime')" />
      <el-table-column label="操作" width="210" fixed="right">
        <template #default="scope">
          <el-button type="primary" link icon="view" @click="handleDetail(scope.row)" v-hasPermi="['oms:order:query']">详情</el-button>
          <el-button type="success" link icon="promotion" @click="handleDelivery(scope.row)" v-hasPermi="['oms:order:ship']">发货</el-button>
          <el-button type="warning" link icon="close" @click="handleCancel(scope.row)" v-hasPermi="['oms:order:cancel']">取消</el-button>
          <el-button type="danger" link icon="delete" @click="handleDelete(scope.row)" v-hasPermi="['oms:order:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 订单详情 + 日志 -->
    <el-drawer title="订单详情" v-model="detailOpen" size="62%" @close="detailClose">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.orderStatus)">{{ detail.orderStatusLabel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总金额">{{ detail.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">{{ detail.payAmount }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ payTypeMap[detail.payType] || '未知' }}</el-descriptions-item>
        <el-descriptions-item label="支付流水号">{{ detail.transactionId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货人">
          {{ (detail.addressSnapshot && detail.addressSnapshot.userName) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="收货电话">
          {{ (detail.addressSnapshot && detail.addressSnapshot.phone) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ detail.addressLabel }}</el-descriptions-item>
        <el-descriptions-item label="下单身份">
          {{ detail.memberId ? '会员 ' + detail.memberId : '游客（未绑定会员）' }}
        </el-descriptions-item>
        <el-descriptions-item label="物流公司">{{ detail.deliveryCompany || '-' }}</el-descriptions-item>
        <el-descriptions-item label="物流单号">{{ detail.deliveryNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="商家备注" :span="2">{{ detail.merchantNote || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">订单商品</el-divider>
      <el-table :data="detail.items || []" border size="small">
        <el-table-column prop="productName" label="商品" :show-overflow-tooltip="true" />
        <el-table-column prop="skuSpec" label="规格" :show-overflow-tooltip="true" width="160" />
        <el-table-column prop="quantity" label="数量" width="70" align="center" />
        <el-table-column prop="unitPrice" label="单价" width="90" align="center" />
        <el-table-column prop="totalPrice" label="小计" width="90" align="center" />
      </el-table>

      <el-divider content-position="left">状态变更日志</el-divider>
      <el-timeline v-loading="logLoading">
        <el-timeline-item v-for="(log, idx) in orderLogs" :key="idx" :timestamp="log.createTime" placement="top" :type="timelineType(log.operType)">
          <div>
            <strong>{{ operTypeMap[log.operType] || log.operType }}</strong>
            <span style="margin-left: 8px; color: #909399">{{ log.operator }}</span>
          </div>
          <div style="margin-top: 4px; color: #606266">
            状态：{{ orderStatusMap[log.fromStatus] || log.fromStatus }}
            <span style="margin: 0 4px">→</span>
            {{ orderStatusMap[log.toStatus] || log.toStatus }}
          </div>
          <div v-if="log.remark" style="margin-top: 2px; color: #909399">备注：{{ log.remark }}</div>
        </el-timeline-item>
        <el-empty v-if="!logLoading && orderLogs.length === 0" description="暂无日志" />
      </el-timeline>
    </el-drawer>

    <!-- 发货 -->
    <el-dialog title="订单发货" v-model="deliveryOpen" width="420px">
      <el-form ref="deliveryRef" :model="deliveryForm" :rules="deliveryRules" label-width="90px">
        <el-form-item label="物流公司" prop="deliveryCompany">
          <el-input v-model="deliveryForm.deliveryCompany" placeholder="如 顺丰速运" />
        </el-form-item>
        <el-form-item label="物流单号" prop="deliveryNo">
          <el-input v-model="deliveryForm.deliveryNo" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button text @click="deliveryOpen = false">取消</el-button>
        <el-button type="primary" :loading="deliveryLoading" @click="submitDelivery">发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="order">
import { listOMSOrder, getOMSOrder, cancelOMSOrder, delOMSOrder, exportOMSOrder, listOrderLog, deliveryOrder } from '@/api/shopping/omsorder.js'
const { proxy } = getCurrentInstance()
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: '',
  sortType: 'asc',
  orderNo: undefined,
  orderStatus: undefined,
  memberId: undefined,
  beginCreateTime: undefined,
  endCreateTime: undefined
})
const dateRange = ref([])
const columns = ref([
  { visible: true, align: 'center', type: '', prop: 'orderNo', label: '订单号', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'user', label: '收货人' },
  { visible: true, align: 'center', type: '', prop: 'memberId', label: '下单身份' },
  { visible: true, align: 'center', type: '', prop: 'totalAmount', label: '总金额' },
  { visible: true, align: 'center', type: '', prop: 'payAmount', label: '实付金额' },
  { visible: true, align: 'center', type: '', prop: 'orderStatusLabel', label: '状态' },
  { visible: true, align: 'center', type: '', prop: 'payType', label: '支付方式' },
  { visible: true, align: 'center', type: '', prop: 'deliveryNo', label: '物流单号', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'createTime', label: '下单时间' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()

const orderStatusMap = { 0: '待付款', 1: '待发货', 2: '已发货', 3: '已完成', 4: '已取消', 5: '已关闭' }
const payTypeMap = { 0: '模拟支付', 1: '微信H5', 2: '支付宝' }
const operTypeMap = { PAY: '支付', CANCEL: '取消', EXPIRE: '超时关闭', DELIVERY: '发货', REFUND: '退款' }

function statusTagType(status) {
  const map = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'success', 4: 'info', 5: 'info' }
  return map[status] || 'info'
}
function timelineType(operType) {
  const map = { PAY: 'success', CANCEL: 'info', EXPIRE: 'warning', DELIVERY: 'primary', REFUND: 'danger' }
  return map[operType] || 'primary'
}

function getList() {
  loading.value = true
  listOMSOrder(queryParams).then((res) => {
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
  queryParams.orderStatus = undefined
  queryParams.memberId = undefined
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
    queryParams.sortType = 'asc'
  }
  handleQuery()
}

/*************** 详情 + 日志 ***************/
const detailOpen = ref(false)
const detail = ref(null)
const orderLogs = ref([])
const logLoading = ref(false)

function handleDetail(row) {
  getOMSOrder(row.id).then((res) => {
    if (res.code == 200) {
      detail.value = res.data
      detailOpen.value = true
      loadLogs(row.id)
    }
  })
}
function loadLogs(id) {
  logLoading.value = true
  listOrderLog({ orderId: id }).then((res) => {
    if (res.code == 200) {
      orderLogs.value = res.data || []
    }
    logLoading.value = false
  })
}
function detailClose() {
  detail.value = null
  orderLogs.value = []
}

/*************** 发货 ***************/
const deliveryOpen = ref(false)
const deliveryLoading = ref(false)
const deliveryRef = ref()
const deliveryForm = reactive({ id: null, deliveryCompany: '', deliveryNo: '' })
const deliveryRules = {
  deliveryCompany: [{ required: true, message: '物流公司不能为空', trigger: 'blur' }],
  deliveryNo: [{ required: true, message: '物流单号不能为空', trigger: 'blur' }]
}
function handleDelivery(row) {
  deliveryForm.id = row.id
  deliveryForm.deliveryCompany = row.deliveryCompany || ''
  deliveryForm.deliveryNo = row.deliveryNo || ''
  deliveryOpen.value = true
}
function submitDelivery() {
  proxy.$refs['deliveryRef'].validate((valid) => {
    if (!valid) return
    deliveryLoading.value = true
    deliveryOrder({ id: deliveryForm.id, deliveryCompany: deliveryForm.deliveryCompany, deliveryNo: deliveryForm.deliveryNo })
      .then(() => {
        proxy.$modal.msgSuccess('发货成功')
        deliveryOpen.value = false
        getList()
      })
      .finally(() => {
        deliveryLoading.value = false
      })
  })
}

/*************** 取消 / 删除 / 导出 ***************/
function handleCancel(row) {
  proxy
    .$confirm('确认取消订单「' + row.orderNo + '」？', '提示', { type: 'warning' })
    .then(() => cancelOMSOrder(row.id))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('已取消')
    })
}
function handleDelete(row) {
  proxy
    .$confirm('是否确认删除订单「' + row.orderNo + '」？', '警告', { type: 'warning' })
    .then(() => delOMSOrder(row.id))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
function handleExport() {
  proxy.$confirm('是否确认导出订单数据?', '警告', { type: 'warning' }).then(async () => {
    await exportOMSOrder({ ...queryParams })
  })
}

handleQuery()
</script>
