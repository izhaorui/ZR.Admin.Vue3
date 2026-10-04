<!--
 * @Descripttion: (订单管理/mms_order)
 * @Author: (admin)
 * @Date: (2025-05-30)
-->
<template>
  <el-collapse class="mb8">
    <el-collapse-item title="操作提示" name="1">
      <div class="tip-line">订单状态流转：待付款 →（支付）→ 待发货 →（发货）→ 待收货 →（确认收货）→ 已完成。</div>
      <div class="tip-line">待付款订单取消后为已关闭；已付款订单退款后为已退款。</div>
    </el-collapse-item>
  </el-collapse>

  <!--
    状态筛选独立成行，不放进下面的 inline 表单：
    表单是行内流布局，el-tabs 塞进去宽度由内容决定，标签一多就换行、并与相邻表单项基线错位。
    它也是本页主筛选（带各状态计数），故不随「隐藏搜索」一起收起。
  -->
  <el-tabs v-model="queryParams.orderStatus" class="order-tabs" @tab-change="handleQuery">
    <el-tab-pane name="">
      <template #label>
        <span class="tab-label">全部 <em class="tab-badge">{{ totalCount }}</em></span>
      </template>
    </el-tab-pane>
    <el-tab-pane :name="parseInt(item.dictValue)" v-for="item in dictStore.orderStatusOptions" :key="item.dictValue">
      <template #label>
        <span class="tab-label">{{ item.dictLabel }} <em class="tab-badge">{{ statsData[item.dictValue] ?? 0 }}</em></span>
      </template>
    </el-tab-pane>
  </el-tabs>

  <!-- label-width 固定：inline 表单的标签宽度默认随文字长度变，四个字段的输入框会左右参差 -->
  <el-form
    :model="queryParams"
    label-position="right"
    label-width="72px"
    inline
    ref="queryRef"
    v-show="showSearch"
    @submit.prevent>
    <el-form-item label="订单号" prop="orderNo">
      <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" class="search-input" @keyup.enter="handleQuery" />
    </el-form-item>
    <el-form-item label="物流单号" prop="deliveryNo">
      <el-input v-model="queryParams.deliveryNo" placeholder="请输入物流单号" class="search-input" @keyup.enter="handleQuery" />
    </el-form-item>
    <el-form-item label="会员ID" prop="memberId">
      <el-input v-model.number="queryParams.memberId" placeholder="请输入会员ID" class="search-input" @keyup.enter="handleQuery" />
    </el-form-item>

    <el-form-item label="下单时间">
      <el-date-picker
        v-model="dateRangeCreateTime"
        type="datetimerange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD HH:mm:ss"
        :default-time="defaultTime"
        :shortcuts="dateOptions"
        class="search-range" />
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
    <el-col :span="1.5">
      <el-button type="primary" plain icon="Upload" @click="importOpen = true" v-hasPermi="['oms:order:ship']"> 批量发货 </el-button>
    </el-col>
    <el-col :span="1.5">
      <el-button type="danger" plain icon="Remove" :disabled="ids.length === 0" @click="handleBatchCancel" v-hasPermi="['oms:order:cancel']">
        批量剔除
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
    <el-table-column type="selection" width="45" align="center" />
    <el-table-column type="expand" width="40">
      <template #default="props">
        <div class="expand-title">商品明细（{{ props.row.items?.length || 0 }}）</div>
        <div class="order-product" v-for="item in props.row.items" :key="item.id">
          <ImagePreview width="56" height="56" :src="item.productPic" />
          <div class="info">
            <div class="name">
              <el-text line-clamp="2">{{ item.productName }}</el-text>
            </div>
            <div class="spec">{{ item.skuSpec || '-' }}</div>
          </div>
          <!-- 金额/数量单独成列右对齐：原来跟在名称下面，多个商品时对不上哪行是哪单 -->
          <div class="amount">
            <div class="price">{{ formatMoney(item.totalPrice) }}</div>
            <div class="quantity">&times; {{ item.quantity }}</div>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="id" label="订单Id" align="center" sortable v-if="columns.showColumn('id')" />
    <el-table-column label="收货信息" min-width="180" v-if="columns.showColumn('addressSnapshot')">
      <template #default="{ row }">
        <div v-if="row.addressSnapshot">
          <div class="flex">
            <el-button
              type="primary"
              icon="edit"
              link
              v-hasPermi="['oms:orderaddress:edit']"
              @click="handleEditAddress(row)"
              v-if="[1, 0].includes(row.orderStatus)">
            </el-button>
            <el-text truncated>{{ row.addressSnapshot.userName }} {{ row.addressSnapshot.phone }}</el-text>
          </div>
          <div class="addr-detail">{{ row.addressLabel }}</div>
        </div>
        <span v-else>—</span>
      </template>
    </el-table-column>
    <el-table-column prop="memberId" label="订单号/用户" align="center" min-width="190" v-if="columns.showColumn('memberId')">
      <template #default="{ row }">
        <div>
          <span class="link-type copy-no" v-clipboard:copy="row.orderNo" v-clipboard:success="copySuccess" title="点击复制订单号">
            {{ row.orderNo }}
          </span>
        </div>
        <div class="mt5">
          <el-tag v-if="row.memberId" size="small" type="success" effect="plain">会员 {{ row.memberId }}</el-tag>
          <span v-else>
            <el-tag size="small" type="info">未绑定会员</el-tag>
            {{ row.addressSnapshot?.phone || row.guestPhone }}
          </span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="totalAmount" label="总金额" sortable min-width="130" v-if="columns.showColumn('totalAmount')">
      <template #default="{ row }">
        <div>
          <span class="amount_label">总金额</span> <span class="text-warning">{{ formatMoney(row.totalAmount) }}</span>
        </div>
        <!-- 金额构成：运费/优惠/积分抵扣/已退金额本期恒为 0，故不渲染；对应能力上线后自动出现 -->
        <div v-if="row.freightAmount > 0">
          <span class="amount_label">运费</span> <span class="text-warning">{{ formatMoney(row.freightAmount) }}</span>
        </div>
        <div v-if="row.discountAmount > 0">
          <span class="amount_label">优惠</span> <span class="text-muted">{{ formatMoney(row.discountAmount) }}</span>
        </div>
        <div v-if="row.integralAmount > 0">
          <span class="amount_label">积分抵扣</span> <span class="text-muted">{{ formatMoney(row.integralAmount) }}</span>
        </div>
        <div>
          <span class="amount_label">付款金额</span> <span class="text-danger">{{ formatMoney(row.payAmount) }}</span>
        </div>
        <div v-if="row.refundAmount > 0">
          <span class="amount_label">已退金额</span> <span class="text-muted">{{ formatMoney(row.refundAmount) }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="orderStatus" label="订单状态" min-width="210" v-if="columns.showColumn('orderStatus')">
      <template #default="{ row }">
        <dict-tag :options="dictStore.orderStatusOptions" :value="row.orderStatus" />

        <!-- 物流信息另起一行：原来物流公司 tag 紧跟状态 tag 同一行，窄列里两段标签基线不齐、行高被撑高 -->
        <template v-if="row.deliveryCompany">
          <div class="logistics">
            <el-tag type="success" size="small" effect="plain">{{ row.deliveryCompany }}</el-tag>
            <span class="delivery-no">{{ row.deliveryNo }}</span>
            <el-button
              type="primary"
              text
              size="small"
              icon="document-copy"
              title="复制「物流公司-物流单号」"
              v-clipboard:success="copySuccess"
              v-clipboard:copy="row.deliveryCompany + '-' + row.deliveryNo" />
          </div>
          <div class="ship-time">发货时间:{{ row.shipTime }}</div>
        </template>
      </template>
    </el-table-column>
    <el-table-column prop="payType" label="支付方式" width="110" v-if="columns.showColumn('payType')">
      <template #default="{ row }">
        <dict-tag :options="dictStore.payTypeOptions" :value="row.payType" />
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="下单/付款时间" width="165" v-if="columns.showColumn('createTime')">
      <template #default="{ row }">
        <!-- tag 用 small：默认尺寸 24px 高会把这一行的行高顶起来，两行叠加尤其明显 -->
        <div class="time-line" v-if="row.createTime">
          <el-tag size="small">下单</el-tag>
          <!-- 列表只显示 MM-DD，跨年订单看不出年份，完整时间挂 title 备查 -->
          <span :title="row.createTime">{{ dayjs(row.createTime).format('MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="time-line" v-if="row.payTime">
          <el-tag type="danger" size="small">付款</el-tag>
          <span :title="row.payTime">{{ dayjs(row.payTime).format('MM-DD HH:mm:ss') }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="refundStatus" label="退款状态" width="100" align="center" v-if="columns.showColumn('refundStatus')">
      <template #default="{ row }">
        <dict-tag :options="dictStore.refundStatusOptions" :value="row.refundStatus" />
      </template>
    </el-table-column>
    <el-table-column prop="cancelTime" label="取消时间" :show-overflow-tooltip="true" v-if="columns.showColumn('cancelTime')" />
    <el-table-column prop="orderNote" label="订单备注" min-width="170" v-if="columns.showColumn('orderNote')">
      <template #default="{ row }">
        <div v-if="row.orderNote"><span class="note-label">买家</span>{{ row.orderNote }}</div>
        <div v-if="row.merchantNote"><span class="note-label">商家</span>{{ row.merchantNote }}</div>
        <span v-if="!row.orderNote && !row.merchantNote">—</span>
      </template>
    </el-table-column>

    <el-table-column prop="confirmStatus" label="确认收货状态" align="center" v-if="columns.showColumn('confirmStatus')">
      <template #default="{ row }">
        <!--
          后端 confirmStatus 的枚举还没进字典 store，这里先透传原值。
          原先绑的是 options.confirmStatusOptions，而本页 script 里并不存在 options，
          一旦有人在「显隐列」里打开本列就会抛 options is not defined，整张表渲染不出来。
          确认枚举后改回 dict-tag 即可。
        -->
        {{ row.confirmStatus ?? '—' }}
      </template>
    </el-table-column>

    <!-- <el-table-column prop="deliverySn" label="物流单号" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('deliverySn')" /> -->

    <el-table-column label="操作" width="190" fixed="right">
      <template #default="scope">
        <!-- 原来用全局 .fr（float: right）：按钮一多就换行并把行高撑开，flex 右对齐更可控 -->
        <div class="row-actions">
          <el-button type="primary" text @click="handlemerchantNote(scope.row)">备注</el-button>
          <el-button type="primary" text size="small" v-hasPermi="['oms:order:query']" @click="handleDetails(scope.row)"> 详情</el-button>
          <!-- <el-button type="primary" text size="small">日志</el-button> -->
          <el-button
            type="danger"
            text
            class="btn-danger-text"
            size="small"
            v-hasPermi="['oms:order:cancel']"
            @click="handleCancel(scope.row)"
            v-if="scope.row.orderStatus == 0">
            剔除
          </el-button>
          <el-button
            type="primary"
            text
            size="small"
            v-hasPermi="['oms:order:ship']"
            @click="handleShipments(scope.row)"
            v-if="scope.row.orderStatus == 1">
            发货
          </el-button>
          <el-button
            type="danger"
            text
            class="btn-danger-text"
            size="small"
            v-hasPermi="['oms:order:refund']"
            v-if="canRefund(scope.row)"
            :loading="refundLoadingId === scope.row.id"
            @click="handleRefund(scope.row)">
            退款
          </el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

  <shipments ref="shipmentsRef" @success="handleQuery"></shipments>
  <merchantNoteForm ref="merchantNoteFormRef" @success="handleQuery"></merchantNoteForm>
  <addressForm ref="addressFormRef" @success="handleQuery"></addressForm>
  <el-dialog title="批量发货导入" v-model="importOpen" width="520px" append-to-body :close-on-click-modal="false">
    <!--
      批量发货不给买家发短信（与 NotifyBuyer 只在发货/退款两处发信的策略一致）：
      逐单发是 N 次同步网络往返 + N 条短信费用，且批量场景买家本就靠订单状态看进度。
      这条提示要写明，否则运营看到"买家没收到发货短信"会误以为没发货成功而重复操作。
    -->
    <el-alert type="info" :closable="false" show-icon class="mb10"
      title="批量发货不会给买家发送短信通知，买家请在「我的订单」查看物流进度" />
    <importData
      importUrl="/shopping/Order/importData"
      templateUrl="shopping/Order/importTemplate"
      :resultFields="importResultFields"
      @success="handleImportSuccess" />
  </el-dialog>
</template>

<script setup name="order">
import { listOMSOrder, cancelOMSOrder, cancelOMSOrders, RefundOrder } from '@/api/shopping/omsorder.js'
import { dayjs, ElMessage } from 'element-plus'
import { formatMoney } from '@/utils/money'
import shipments from './components/ShipmentsForm.vue'
import merchantNoteForm from './components/MerchantNoteForm.vue'
import addressForm from './components/AddressForm.vue'
import importData from '@/components/ImportData'
import router from '@/router'
import useDictStore from '@/store/modules/dict'

const { proxy } = getCurrentInstance()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'CreateTime',
  sortType: 'desc',
  orderNo: undefined,
  memberId: undefined,
  orderStatus: '',
  createTime: undefined,
  confirmStatus: '',
  deliveryNo: undefined
})
const dictStore = useDictStore()
// 退款请求进行中的订单 Id（按钮级 loading，防连点重复退款）
const refundLoadingId = ref()

/**
 * 订单退款：后端关闭订单并回补库存，渠道退款由人工在支付渠道完成后操作
 */
/**
 * 是否展示"退款"入口：
 * - 已付款且未取消的订单（待发货/已发货/已完成）：发起退款；
 * - 已取消且退款状态为"退款中(1)"的订单：确认渠道退款完成。
 *   （取消"已支付"订单会置为退款中，渠道退款由人工在支付渠道完成后回到这里确认）
 *
 * ⚠️ 待付款(0)刻意不在此列：它没有款可退，正解是同一行左侧的「取消」。
 * 后端 RefundOrder 对未付款单也会显式拒绝，这里只是不给一个点了必然报错的入口。
 */
function canRefund(row) {
  const status = parseInt(row.orderStatus)
  if ([1, 2, 3].includes(status)) return true
  return status === 4 && row.refundStatus === 1
}

/**
 * 订单退款入口：区分"发起退款"与"确认退款完成"两种语义。
 * - 发起退款：后端关闭订单，未发货回补库存，已发货只关闭订单（货已出库，库存不自动加回）；渠道退款需人工完成。
 * - 确认完成：订单此前已取消且处于"退款中"，此处仅把退款状态推进为"已退款"，不再变动库存。
 */
function handleRefund(row) {
  const isConfirm = parseInt(row.orderStatus) === 4 && row.refundStatus === 1
  const message = isConfirm
    ? `确认订单「${row.orderNo}」的渠道退款已完成？确认后订单退款状态置为"已退款"，不再回补库存。`
    : `确认退款订单「${row.orderNo}」？实付金额 ${formatMoney(row.payAmount)}。未发货会回补库存；已发货只关闭订单（货已出库，库存不自动加回）。渠道退款需人工在支付渠道完成。`
  proxy
    .$confirm(message, isConfirm ? '确认退款完成' : '退款确认', {
      confirmButtonText: isConfirm ? '确认已完成' : '确认退款',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      refundLoadingId.value = row.id
      return RefundOrder({ orderNo: row.orderNo })
    })
    .then(() => {
      proxy.$modal.msgSuccess(isConfirm ? '已确认退款完成' : '退款成功')
      getList()
    })
    .finally(() => {
      refundLoadingId.value = undefined
    })
}
const columns = ref([
  { visible: false, align: 'center', type: '', prop: 'id', label: '订单Id' },
  { visible: true, align: 'center', type: '', prop: 'memberId', label: '订单号/用户' },
  { visible: true, align: 'center', type: '', prop: 'totalAmount', label: '总金额' },
  { visible: true, align: 'center', type: '', prop: 'payAmount', label: '付款金额' },
  { visible: true, align: 'center', type: 'dict', prop: 'orderStatus', label: '订单状态' },
  { visible: true, align: 'center', type: 'dict', prop: 'refundStatus', label: '退款状态' },
  { visible: true, align: 'center', type: '', prop: 'payType', label: '支付方式' },
  { visible: true, align: 'center', type: '', prop: 'createTime', label: '下单时间', showOverflowTooltip: true },
  { visible: false, align: 'center', type: '', prop: 'cancelTime', label: '取消时间', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'orderNote', label: '订单备注', showOverflowTooltip: true },
  // { visible: false, align: 'center', type: '', prop: 'merchantNote', label: '商家备注', showOverflowTooltip: true },
  { visible: false, align: 'center', type: 'dict', prop: 'confirmStatus', label: '确认收货状态' },
  { visible: true, align: 'center', type: '', prop: 'addressSnapshot', label: '收货地址', showOverflowTooltip: true }
])
const total = ref(0)
const dataList = ref([])
const statsData = ref({})
// 全部数量 = 各状态之和
const totalCount = computed(() => Object.values(statsData.value).reduce((sum, n) => sum + (Number(n) || 0), 0))
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])
const end = dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD') + ' 23:59:59'
const start = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD 00:00:00')
// 下单时间时间范围
const dateRangeCreateTime = ref([start, end])

var dictParams = []

function getList() {
  proxy.addDateRange(queryParams, dateRangeCreateTime.value, 'CreateTime')
  loading.value = true
  listOMSOrder(queryParams)
    .then((res) => {
      const { code, data } = res
      if (code == 200) {
        dataList.value = data.result
        total.value = data.totalNum
        statsData.value = data.extra?.statusStats || {}
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  // 下单时间时间范围
  dateRangeCreateTime.value = []
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

// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出订单管理数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await proxy.downFile('/shopping/Order/export', { ...queryParams })
    })
}
function copySuccess() {
  ElMessage.success('复制成功')
}
const shipmentsRef = ref()
/**
 * 发货
 */
function handleShipments(row) {
  // 收货信息逐项判空：原先只判 addressSnapshot 是否存在，而后端已改为校验字段完整性。
  // 字段全为 null 的空对象能通过前端这道检查，却会被后端拒掉，两边规则必须一致。
  const addr = row.addressSnapshot
  if (!addr || !addr.userName || !addr.phone || !addr.province || !addr.detailAddress) {
    ElMessage.error('该订单收货信息不完整（收件人/手机号/地区/详细地址有缺失），无法发货')
    return
  }
  shipmentsRef.value.handleOpen(row)
}

const merchantNoteFormRef = ref()
function handlemerchantNote(row) {
  merchantNoteFormRef.value.handleOpen(row.orderNo)
}

const importOpen = ref(false)
const importResultFields = [
  { prop: 'orderNo', label: '订单号' },
  { prop: 'deliveryCompany', label: '物流公司' },
  { prop: 'deliveryNo', label: '物流单号' },
  { prop: 'status', label: '结果' }
]
function handleImportSuccess() {
  importOpen.value = false
  getList()
}

const addressFormRef = ref()
/**
 * 修改收货地址信息
 * @param orderNo
 * @param row
 */
function handleEditAddress(row) {
  addressFormRef.value.handleOpen(row.orderNo, row.addressSnapshot)
}

/**
 * 详情
 * @param row
 */
function handleDetails(row) {
  router.push({
    path: '/orderdetails',
    query: {
      id: row.id
    }
  })
}

/**
 * 剔除订单（取消并回补库存，仅待付款生效）
 * @param row
 */
function handleCancel(row) {
  proxy
    .$confirm(`确认剔除订单「${row.orderNo}」？剔除后将释放其占用的库存。`, '剔除订单', {
      confirmButtonText: '确认剔除',
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(() => cancelOMSOrder(row.id))
    .then(() => {
      proxy.$modal.msgSuccess('已剔除并释放库存')
      getList()
    })
}

// 表格多选变化
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
}

/**
 * 批量剔除订单（取消并回补库存，仅待付款/待发货生效，其余状态自动跳过）
 */
function handleBatchCancel() {
  if (ids.value.length === 0) return
  proxy
    .$confirm(`确认批量剔除选中的 ${ids.value.length} 条订单？剔除后将释放其占用的库存（非待付款/待发货状态的订单将被自动跳过）。`, '批量剔除', {
      confirmButtonText: '确认剔除',
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(() => cancelOMSOrders(ids.value))
    .then((res) => {
      const done = res?.data ?? res
      proxy.$modal.msgSuccess(`已剔除 ${done} 条并释放库存`)
      proxy.$refs.table?.clearSelection()
      getList()
    })
}
handleQuery()
</script>
<style lang="scss" scoped>
/* 操作提示：两条流程说明各占一行，行高给足，别挤成两段 */
.tip-line {
  line-height: 1.7;
}
/* 状态筛选行：上方已有提示块、下方紧接搜索区，收掉 el-tabs 默认的 15px */
.order-tabs {
  margin-bottom: 4px;
}
/* 搜索区控件统一宽度：inline 表单里 el-input 会撑满剩余空间，各字段长度不一导致参差 */
.search-input {
  width: 200px;
}
.search-range {
  width: 360px;
}

.amount_label {
  display: inline-block;
  width: 60px;
  text-align: right;
  padding-right: 6px;
  color: var(--el-text-color-secondary);
}
.flex {
  display: flex;
}
.addr-detail {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-top: 4px;
}
.copy-no {
  cursor: pointer;
  color: var(--el-color-primary);
  &:hover {
    text-decoration: underline;
  }
}
.expand-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  margin-bottom: 4px;
}

/* 订单状态列里的物流信息：公司名与单号同一行，发货时间另起一行 */
.logistics {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
}
.delivery-no {
  word-break: break-all;
}
.ship-time {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 下单/付款时间：tag 与时间基线对齐 */
.time-line {
  display: flex;
  align-items: center;
  gap: 6px;

  & + .time-line {
    margin-top: 4px;
  }
}

/* 订单备注的「买家/商家」前缀，用浅底小标签代替原来的加粗独立行 */
.note-label {
  display: inline-block;
  min-width: 30px;
  margin-right: 6px;
  padding: 0 4px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
}

.order-product {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;

  &:first-of-type {
    padding-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
}

.order-product .info {
  flex: 1;
  /* flex 子项默认 min-width:auto，商品名过长会把右侧金额挤出可视区 */
  min-width: 0;
}

.order-product .spec {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.order-product .amount {
  flex-shrink: 0;
  min-width: 96px;
  text-align: right;
}

.order-product .price {
  font-weight: 600;
  /* 原来写死 #f44，暗色模式下不跟主题走 */
  color: var(--el-color-danger);
}

.order-product .quantity {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 操作列按钮组右对齐 */
.row-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.tab-badge {
  display: inline-block;
  min-width: 18px;
  padding: 0 5px;
  height: 16px;
  line-height: 16px;
  font-size: 11px;
  font-style: normal;
  text-align: center;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}
:deep(.el-tabs__item.is-active) .tab-badge {
  color: #fff;
  background: var(--el-color-primary);
}

/* 强制剔除按钮显示为危险红色（防止被主题/全局样式覆盖文字色） */
.btn-danger-text {
  color: var(--el-color-danger) !important;
}
.btn-danger-text:hover {
  color: var(--el-color-danger) !important;
}
</style>
