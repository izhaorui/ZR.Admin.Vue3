<!--
 * @Descripttion: (售后单/oms_after_sale)
 * @Author: (admin)
 * @Date: (2026-10-02)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="售后单号" prop="afterSaleNo">
        <el-input v-model="queryParams.afterSaleNo" placeholder="请输入售后单号" style="width: 200px" />
      </el-form-item>
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" style="width: 200px" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择" clearable style="width: 140px">
          <el-option v-for="(label, val) in typeMap" :key="val" :label="label" :value="Number(val)" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 140px">
          <el-option v-for="(label, val) in statusMap" :key="val" :label="label" :value="Number(val)" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请时间" prop="dateRange">
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

    <el-table :data="dataList" v-loading="loading" ref="table" border header-cell-class-name="el-table-header-cell" highlight-current-row>
      <el-table-column prop="afterSaleNo" label="售后单号" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('afterSaleNo')" />
      <el-table-column prop="orderNo" label="订单号" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('orderNo')" />
      <el-table-column prop="type" label="类型" align="center" v-if="columns.showColumn('type')">
        <template #default="scope">{{ typeMap[scope.row.type] || '未知' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" v-if="columns.showColumn('status')">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusMap[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applyAmount" label="申请金额" align="center" v-if="columns.showColumn('applyAmount')" />
      <el-table-column prop="refundAmount" label="实际退款" align="center" v-if="columns.showColumn('refundAmount')">
        <template #default="scope">{{ Number(scope.row.refundAmount) > 0 ? scope.row.refundAmount : '-' }}</template>
      </el-table-column>
      <el-table-column prop="goodsSummary" label="商品" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('goodsSummary')" />
      <el-table-column prop="applyTime" label="申请时间" align="center" v-if="columns.showColumn('applyTime')" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 0"
            type="primary"
            link
            icon="edit"
            @click="handleAudit(scope.row)"
            v-hasPermi="['shop:aftersale:audit']">审核</el-button>
          <el-button
            v-if="scope.row.status === 3"
            type="primary"
            link
            icon="check"
            @click="handleReceive(scope.row)"
            v-hasPermi="['shop:aftersale:audit']">确认收货</el-button>
          <el-button
            v-if="scope.row.status === 4"
            type="primary"
            link
            icon="money"
            @click="handleRefund(scope.row)"
            v-hasPermi="['shop:aftersale:refund']">登记退款</el-button>
          <el-button
            v-if="canCancel(scope.row.status)"
            type="danger"
            link
            icon="close"
            @click="handleCancel(scope.row)"
            v-hasPermi="['shop:aftersale:audit']">撤销</el-button>
          <el-button type="primary" link icon="view" @click="handleDetail(scope.row)" v-hasPermi="['shop:aftersale:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 审核：通过 / 驳回 -->
    <el-dialog :title="auditForm.approved ? '审核通过' : '审核驳回'" v-model="auditOpen" width="480px" append-to-body>
      <el-form label-width="90px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :value="true">通过</el-radio>
            <el-radio :value="false">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="auditForm.approved ? '审核备注' : '驳回原因'" :required="!auditForm.approved">
          <el-input
            v-model="auditForm.auditRemark"
            type="textarea"
            :rows="3"
            :placeholder="auditForm.approved ? '选填' : '驳回必须说明原因，买家可见'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 登记渠道退款：约定先由人工在支付渠道完成，这里只做登记与订单落账 -->
    <el-dialog title="登记渠道退款" v-model="refundOpen" width="520px" append-to-body>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="请先在支付渠道完成退款，再回到这里登记"
        description="登记后售后单置为已完成，并把退款额累加到订单（超额会被拒绝）。"
        style="margin-bottom: 12px" />
      <el-descriptions :column="2" border size="small" style="margin-bottom: 12px">
        <el-descriptions-item label="售后单号">{{ refundForm.afterSaleNo }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ refundForm.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="申请金额">{{ refundForm.applyAmount }} 元</el-descriptions-item>
        <el-descriptions-item label="可退余额">{{ refundable }} 元</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="110px">
        <el-form-item label="退款金额" required>
          <el-input-number v-model="refundForm.refundAmount" :min="0.01" :precision="2" :step="1" style="width: 180px" />
          <span class="tip">元（默认按申请金额，可下调）</span>
        </el-form-item>
        <el-form-item label="渠道退款单号" required>
          <el-input v-model="refundForm.refundChannelNo" placeholder="微信退款单号等，用于与渠道流水核对" style="width: 300px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundOpen = false">取消</el-button>
        <el-button type="primary" @click="submitRefund">确定完成售后</el-button>
      </template>
    </el-dialog>

    <!-- 详情 -->
    <el-drawer title="售后单详情" v-model="detailOpen" size="55%" @close="detailClose">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="售后单号">{{ detail.afterSaleNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)">{{ statusMap[detail.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeMap[detail.type] }}</el-descriptions-item>
        <el-descriptions-item label="商品" :span="2">{{ detail.goodsSummary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单实付">{{ detail.orderPayAmount }} 元</el-descriptions-item>
        <el-descriptions-item label="订单已退">{{ detail.orderRefundAmount }} 元</el-descriptions-item>
        <el-descriptions-item label="申请金额">{{ detail.applyAmount }} 元</el-descriptions-item>
        <el-descriptions-item label="实际退款">{{ Number(detail.refundAmount) > 0 ? detail.refundAmount + ' 元' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请原因">{{ detail.reason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="补充说明" :span="2">{{ detail.describe || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">审核</el-divider>
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="审核人">{{ detail.auditBy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ detail.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2">{{ detail.auditRemark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">退货物流</el-divider>
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="退货物流">{{ detail.returnCompany || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退货单号">{{ detail.returnNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="买家寄回时间">{{ detail.returnTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="商家收货时间">{{ detail.receiveTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收货备注" :span="2">{{ detail.receiveRemark || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">退款</el-divider>
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="渠道退款单号">{{ detail.refundChannelNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款登记时间">{{ detail.refundTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="撤销时间" :span="2">{{ detail.cancelTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup name="afterSale">
import { listAfterSale, getAfterSale, auditAfterSale, receiveAfterSale, refundAfterSale, cancelAfterSale } from '@/api/shopping/afterSale.js'
const { proxy } = getCurrentInstance()
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  afterSaleNo: undefined,
  orderNo: undefined,
  type: undefined,
  status: undefined,
  beginApplyTime: undefined,
  endApplyTime: undefined
})
const dateRange = ref([])
const columns = ref([
  { visible: true, align: 'center', type: '', prop: 'afterSaleNo', label: '售后单号', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'orderNo', label: '订单号', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'type', label: '类型' },
  { visible: true, align: 'center', type: '', prop: 'status', label: '状态' },
  { visible: true, align: 'center', type: '', prop: 'applyAmount', label: '申请金额' },
  { visible: true, align: 'center', type: '', prop: 'refundAmount', label: '实际退款' },
  { visible: true, align: 'center', type: '', prop: 'goodsSummary', label: '商品', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'applyTime', label: '申请时间' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()

// 与后端 AfterSaleTypeEnum / AfterSaleStatusEnum 逐值对应
const typeMap = { 1: '仅退款', 2: '退货退款' }
const statusMap = { 0: '待审核', 1: '已驳回', 2: '待买家退货', 3: '待商家收货', 4: '待退款', 5: '已完成', 6: '已撤销' }

function statusTagType(status) {
  const map = { 0: 'warning', 1: 'danger', 2: 'info', 3: 'info', 4: 'warning', 5: 'success', 6: 'info' }
  return map[status] || 'info'
}

/** 进入退款环节后钱已在退，撤销无从生效；后端也会拒，这里按同一口径隐藏按钮 */
function canCancel(status) {
  return [0, 2, 3].includes(status)
}

function getList() {
  loading.value = true
  listAfterSale(queryParams)
    .then((res) => {
      const { code, data } = res
      if (code == 200) {
        dataList.value = data.result
        total.value = data.totalNum
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function handleQuery() {
  queryParams.pageNum = 1
  queryParams.beginApplyTime = undefined
  queryParams.endApplyTime = undefined
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.beginApplyTime = dateRange.value[0] + ' 00:00:00'
    queryParams.endApplyTime = dateRange.value[1] + ' 23:59:59'
  }
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  dateRange.value = []
  queryParams.afterSaleNo = undefined
  queryParams.orderNo = undefined
  queryParams.type = undefined
  queryParams.status = undefined
  queryParams.beginApplyTime = undefined
  queryParams.endApplyTime = undefined
  handleQuery()
}

/*************** 审核 ***************/
const auditOpen = ref(false)
const auditForm = ref({ id: null, approved: true, auditRemark: '' })

function handleAudit(row) {
  auditForm.value = { id: row.id, approved: true, auditRemark: '' }
  auditOpen.value = true
}

function submitAudit() {
  if (!auditForm.value.approved && !auditForm.value.auditRemark) {
    proxy.$modal.msgWarning('驳回时必须填写原因')
    return
  }
  auditAfterSale(auditForm.value).then((res) => {
    if (res.code == 200) {
      proxy.$modal.msgSuccess(res.msg || '审核完成')
      auditOpen.value = false
      getList()
    }
  })
}

/*************** 确认收到退货 ***************/
function handleReceive(row) {
  proxy
    .$modal.confirm('确认已收到买家退回的商品？确认后进入待退款，退款完成后货才会回补可售库存。')
    .then(() => receiveAfterSale(row.id, undefined))
    .then((res) => {
      if (res.code == 200) {
        proxy.$modal.msgSuccess(res.msg || '已确认收到退货')
        getList()
      }
    })
    .catch(() => {})
}

/*************** 登记退款 ***************/
const refundOpen = ref(false)
const refundForm = ref({
  id: null,
  afterSaleNo: '',
  orderNo: '',
  applyAmount: 0,
  orderPayAmount: 0,
  orderRefundAmount: 0,
  refundAmount: 0,
  refundChannelNo: ''
})

/** 可退余额：订单实付减去已退，后端落账时也有同样护栏，这里只是提前提示 */
const refundable = computed(() => {
  const left = Number(refundForm.value.orderPayAmount || 0) - Number(refundForm.value.orderRefundAmount || 0)
  return (left > 0 ? left : 0).toFixed(2)
})

function handleRefund(row) {
  refundForm.value = {
    id: row.id,
    afterSaleNo: row.afterSaleNo,
    orderNo: row.orderNo,
    applyAmount: row.applyAmount,
    orderPayAmount: row.orderPayAmount,
    orderRefundAmount: row.orderRefundAmount,
    // 默认按申请金额，运营可下调（扣运费等）
    refundAmount: Number(row.applyAmount),
    refundChannelNo: ''
  }
  refundOpen.value = true
}

function submitRefund() {
  if (!refundForm.value.refundAmount || refundForm.value.refundAmount <= 0) {
    proxy.$modal.msgWarning('退款金额必须大于 0')
    return
  }
  if (!refundForm.value.refundChannelNo) {
    proxy.$modal.msgWarning('请填写渠道退款单号')
    return
  }
  refundAfterSale({
    id: refundForm.value.id,
    refundAmount: refundForm.value.refundAmount,
    refundChannelNo: refundForm.value.refundChannelNo
  }).then((res) => {
    if (res.code == 200) {
      proxy.$modal.msgSuccess(res.msg || '退款已登记')
      refundOpen.value = false
      getList()
    }
  })
}

/*************** 撤销 ***************/
function handleCancel(row) {
  proxy
    .$modal.confirm('确认撤销该售后申请？撤销后买家需重新申请。')
    .then(() => cancelAfterSale(row.id))
    .then((res) => {
      if (res.code == 200) {
        proxy.$modal.msgSuccess(res.msg || '已撤销')
        getList()
      }
    })
    .catch(() => {})
}

/*************** 详情 ***************/
const detailOpen = ref(false)
const detail = ref(null)

function handleDetail(row) {
  detail.value = null
  detailOpen.value = true
  getAfterSale(row.id).then((res) => {
    if (res.code == 200) {
      detail.value = res.data
    }
  })
}

function detailClose() {
  detail.value = null
}

handleQuery()
</script>

<style scoped>
.tip {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
