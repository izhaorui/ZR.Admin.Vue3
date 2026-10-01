<!--
 * @Descripttion: (订单管理/mms_order)
 * @Author: (admin)
 * @Date: (2025-05-30)
-->
<template>
  <el-collapse>
    <el-collapse-item title="操作提示" name="1">
      <div>*订单状态有待付款，待发货，待收货，已完成，已关闭。</div>
      <div>*待付款订单取消后则为已关闭。待付款订单支付后则为待发货。待发货订单发货后则为待收货。待收货订单收货后则为已完成。</div>
    </el-collapse-item>
  </el-collapse>
  <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
    <el-tabs v-model="queryParams.orderStatus" class="demo-tabs" @tab-change="handleQuery">
      <el-tab-pane name="">
        <template #label>
          <span class="tab-label"
            >全部 <em class="tab-badge">{{ totalCount }}</em></span
          >
        </template>
      </el-tab-pane>
      <el-tab-pane :name="parseInt(item.dictValue)" v-for="item in dictStore.orderStatusOptions" :key="item.dictValue">
        <template #label>
          <span class="tab-label"
            >{{ item.dictLabel }} <em class="tab-badge">{{ statsData[item.dictValue] ?? 0 }}</em></span
          >
        </template>
      </el-tab-pane>
    </el-tabs>
    <el-form-item label="订单号" prop="orderNo">
      <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" />
    </el-form-item>
    <el-form-item label="物流单号" prop="deliveryNo">
      <el-input v-model="queryParams.deliveryNo" placeholder="请输入物流单号" />
    </el-form-item>
    <el-form-item label="会员ID" prop="memberId">
      <el-input v-model.number="queryParams.memberId" placeholder="请输入会员ID" />
    </el-form-item>

    <el-form-item label="下单时间">
      <el-date-picker
        v-model="dateRangeCreateTime"
        type="datetimerange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD HH:mm:ss"
        :default-time="defaultTime"
        :shortcuts="dateOptions">
      </el-date-picker>
    </el-form-item>
    <!-- <el-form-item label="确认收货状态" prop="confirmStatus">
        <el-radio-group v-model="queryParams.confirmStatus">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in options.confirmStatusOptions" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item> -->
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
          <ImagePreview style="width: 60px" :src="item.productPic"></ImagePreview>
          <div class="info">
            <div class="name">
              <el-text line-clamp="2">{{ item.productName }}</el-text>
            </div>
            <div>
              <span class="price"> ￥{{ item.totalPrice }} </span>
              x{{ item.quantity }}
            </div>
            <div>{{ item.skuSpec }}</div>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="id" label="订单Id" align="center" sortable v-if="columns.showColumn('id')" />
    <el-table-column label="收货信息" width="170" v-if="columns.showColumn('addressSnapshot')">
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
    <el-table-column prop="memberId" label="订单号/用户" align="center" v-if="columns.showColumn('memberId')">
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
    <el-table-column prop="totalAmount" label="总金额" sortable width="120" v-if="columns.showColumn('totalAmount')">
      <template #default="{ row }">
        <div>
          <span class="amount_label">总金额</span> <span class="text-warning">￥{{ row.totalAmount }}</span>
        </div>
        <div>
          <span class="amount_label">付款金额</span> <span class="text-danger">￥{{ row.payAmount }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="orderStatus" label="订单状态" width="190" v-if="columns.showColumn('orderStatus')">
      <template #default="{ row }">
        <dict-tag :options="dictStore.orderStatusOptions" :value="row.orderStatus" />

        <template v-if="row.deliveryCompany">
          <el-tag type="success" class="ml10"> {{ row.deliveryCompany }} </el-tag>
          <div>
            物流单号:{{ row.deliveryNo }}

            <el-button
              type="danger"
              text
              icon="document-copy"
              plain
              class="ml10"
              v-clipboard:success="copySuccess"
              v-clipboard:copy="row.deliveryCompany + '-' + row.deliveryNo">
            </el-button>
          </div>
          <div>发货时间:{{ row.shipTime }}</div>
        </template>
      </template>
    </el-table-column>
    <el-table-column prop="payType" label="支付方式" width="110" v-if="columns.showColumn('payType')">
      <template #default="{ row }">
        <dict-tag :options="dictStore.payTypeOptions" :value="row.payType" />
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="下单/付款时间" width="150" v-if="columns.showColumn('createTime')">
      <template #default="{ row }">
        <div v-if="row.createTime">
          <el-tag>下单</el-tag>
          {{ dayjs(row.createTime).format('MM-DD HH:mm:ss') }}
        </div>
        <div v-if="row.payTime">
          <el-tag type="danger">付款</el-tag>
          {{ dayjs(row.payTime).format('MM-DD HH:mm:ss') }}
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="cancelTime" label="取消时间" :show-overflow-tooltip="true" v-if="columns.showColumn('cancelTime')" />
    <el-table-column prop="orderNote" label="订单备注" width="140" v-if="columns.showColumn('orderNote')">
      <template #default="{ row }">
        <template v-if="row.orderNote">
          <div style="font-size: 12px; font-weight: bold">买家备注</div>
          {{ row.orderNote }}
        </template>

        <template v-if="row.merchantNote">
          <div style="font-size: 12px; font-weight: bold">商家备注</div>
          {{ row.merchantNote }}
        </template>
      </template>
    </el-table-column>

    <el-table-column prop="confirmStatus" label="确认收货状态" align="center" v-if="columns.showColumn('confirmStatus')">
      <template #default="scope">
        <dict-tag :options="options.confirmStatusOptions" :value="scope.row.confirmStatus" />
      </template>
    </el-table-column>

    <!-- <el-table-column prop="deliverySn" label="物流单号" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('deliverySn')" /> -->

    <el-table-column label="操作" width="170" fixed="right">
      <template #default="scope">
        <div class="fr">
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
        </div>
      </template>
    </el-table-column>
  </el-table>
  <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

  <shipments ref="shipmentsRef" @success="handleQuery"></shipments>
  <merchantNoteForm ref="merchantNoteFormRef" @success="handleQuery"></merchantNoteForm>
  <addressForm ref="addressFormRef" @success="handleQuery"></addressForm>
  <el-dialog title="批量发货导入" v-model="importOpen" width="520px" append-to-body :close-on-click-modal="false">
    <importData
      importUrl="/shopping/Order/importData"
      templateUrl="shopping/Order/importTemplate"
      :resultFields="importResultFields"
      @success="handleImportSuccess" />
  </el-dialog>
</template>

<script setup name="order">
import { listOMSOrder, cancelOMSOrder, cancelOMSOrders } from '@/api/shopping/omsorder.js'
import { dayjs, ElMessage } from 'element-plus'
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
const columns = ref([
  { visible: false, align: 'center', type: '', prop: 'id', label: '订单Id' },
  { visible: true, align: 'center', type: '', prop: 'memberId', label: '订单号/用户' },
  { visible: true, align: 'center', type: '', prop: 'totalAmount', label: '总金额' },
  { visible: true, align: 'center', type: '', prop: 'payAmount', label: '付款金额' },
  { visible: true, align: 'center', type: 'dict', prop: 'orderStatus', label: '订单状态' },
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
  if (!row.addressSnapshot) {
    ElMessage.error('用户还未选择收货地址不能发货')
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
.amount_label {
  width: 60px;
  display: inline-block;
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
  margin-bottom: 8px;
}

.order-product {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  margin-top: 12px;
}

.order-product .info {
  flex: 1;
  padding: 0 10px;
}

.order-product .price {
  color: #f44;
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
