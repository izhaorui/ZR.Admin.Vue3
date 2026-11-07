<template>
  <div class="p-4">
    <!--
      经营概览放在最上面：先回答"这个商城健康吗"（客单价/退款率/售后率），
      再往下看趋势与排行。时间范围与下面的图表各自独立，默认同一区间。
    -->
    <el-card class="mb10">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="mr10">经营概览</span>
          <el-date-picker
            v-model="overviewDateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="defaultTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="fetchOverview"
            style="width: 320px"
            :shortcuts="dateOptions"></el-date-picker>
        </div>
      </template>
      <el-row :gutter="12" v-if="overview">
        <el-col :span="4">
          <el-statistic title="有效订单" :value="overview.orderCount" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="实收金额" :precision="2" :value="overview.totalPaid" prefix="¥" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="客单价" :precision="2" :value="overview.avgOrderAmount" prefix="¥" />
        </el-col>
        <el-col :span="4">
          <el-statistic title="金额退款率" :precision="2" :value="percent(overview.refundAmountRate)">
            <template #suffix>
              <span class="stat-hint">退款 {{ money(overview.refundAmount) }}</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="4">
          <el-statistic title="售后率" :precision="2" :value="percent(overview.afterSaleRate)">
            <template #suffix>
              <span class="stat-hint">{{ overview.afterSaleCount }} 单</span>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="4">
          <el-statistic title="复购率" :precision="2" :value="percent(overview.repurchaseRate)">
            <template #suffix>
              <span class="stat-hint">{{ overview.memberOrderCount }} 位买家</span>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
      <el-row :gutter="12" class="mt10" v-if="overview">
        <el-col :span="12">
          <div class="stat-line">
            <span class="stat-line__label">商品形态分布</span>
            <span>
              实物 {{ overview.physicalOrderCount }} 单 / 虚拟 {{ overview.virtualOrderCount }} 单
              <b>（虚拟占比 {{ percent(overview.virtualOrderRate) }}%）</b>
            </span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="stat-line">
            <span class="stat-line__label">单量退款率</span>
            <span> {{ overview.refundOrderCount }} / {{ overview.orderCount }} 单 （{{ percent(overview.refundOrderRate) }}%） </span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="mb10">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="mr10">销售总额</span>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="defaultTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="fetchSales"
            style="width: 300px"
            :shortcuts="dateOptions"></el-date-picker>
        </div>
      </template>
      <el-row :gutter="20" class="mb10" v-if="saleInfo">
        <el-col :span="6">
          <el-statistic title="销售总额" :value="saleInfo.totalSales" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="订单数" :value="saleInfo.orderCount" />
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="mr10">销售趋势</span>
              <el-date-picker
                v-model="trendDateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="defaultTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="fetchTrendData"
                style="width: 300px"
                :shortcuts="dateOptions"></el-date-picker>
            </div>
          </template>
          <div ref="lineChartRef" style="height: 300px" />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="mr10">商品销量排行</span>
              <el-date-picker
                v-model="rankDateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="defaultTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 300px"
                @change="fetchTopProduct"
                :shortcuts="dateOptions"></el-date-picker>
            </div>
          </template>
          <div ref="barChartRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt10">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="mr10">
                退款商品排行
                <el-tooltip placement="top">
                  <template #content>
                    <div style="max-width: 260px">
                      口径：退款金额是订单级字段，拆不到商品上。<br />
                      此处统计的是「该商品出现在多少笔退款订单里」与「这些订单里该商品的销售额」，
                      <b>不是退款金额</b>；退款总额请看上方经营概览。
                    </div>
                  </template>
                  <el-tag type="info" effect="plain" size="small">口径说明</el-tag>
                </el-tooltip>
              </span>
              <el-date-picker
                v-model="refundDateRange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="defaultTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="fetchRefundTop"
                style="width: 320px"
                :shortcuts="dateOptions"></el-date-picker>
            </div>
          </template>
          <div ref="refundChartRef" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { echarts } from '@/utils/echarts'
import { getBusinessOverview, listRefundTopProduct, listSales, listSalesTrade, listSaleTopProduct } from '@/api/shopping/omsorder'
import { dayjs } from 'element-plus'
const end = dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD') + ' 23:59:59'
const start = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD 00:00:00')
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

// 日期区间：概览与退款排行各自独立，默认与销售统计同一区间
const dateRange = ref([start, end])
const trendDateRange = ref([start, end])
const rankDateRange = ref([start, end])
const overviewDateRange = ref([start, end])
const refundDateRange = ref([start, end])
const lineChartRef = ref(null)
const barChartRef = ref(null)
const refundChartRef = ref(null)

let lineChart, barChart, refundChart

/** 0~1 的比率转百分比显示；服务端已算好比率，这里只做格式化，不在 frontend 相除 */
const percent = (v) => `${((v || 0) * 100).toFixed(2)}%`
const money = (v) => `¥${(v || 0).toFixed(2)}`

const renderLineChart = (data) => {
  if (!lineChart) lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.map((d) => dayjs(d.date).format('YYYY/MM/DD'))
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: data.map((d) => d.totalSales)
      }
    ]
  })
}

const renderBarChart = (data) => {
  const colorList = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC']
  if (!barChart) barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: {
      left: '120px',
      right: '30px',
      bottom: '30px',
      top: '30px'
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}' // 默认就是整数显示，但这里加上确保不会被格式化成小数
      },
      splitNumber: 5, // 控制大致的刻度数
      minInterval: 1 // ✅ 最小间隔为1，防止出现小数
    },
    yAxis: {
      type: 'category',
      data: data.map((d) => d.productName),
      axisLabel: {
        formatter: function (value) {
          const maxLineLength = 8 // 每行最多8个字
          const maxLines = 2 // 最多显示2行
          const reg = new RegExp(`.{1,${maxLineLength}}`, 'g')
          const lines = value.match(reg) || []
          if (lines.length <= maxLines) {
            return lines.join('\n')
          }
          return lines.slice(0, maxLines).join('\n') + '…' // 超出部分省略
        }
      }
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: data.map((d, index) => ({
          value: d.totalSold,
          itemStyle: {
            color: colorList[index % colorList.length] // 按索引轮换颜色
          }
        })),
        barWidth: '50%'
      }
    ]
  })
}

const renderRefundChart = (data) => {
  if (!refundChart) refundChart = echarts.init(refundChartRef.value)
  if (!data?.length) {
    refundChart.clear()
    return
  }
  refundChart.setOption({
    tooltip: {
      trigger: 'axis',
      // 金额与笔数单位不同，tooltip 里标清楚，避免把"3 笔"看成"3 元"
      formatter: (params) => {
        const p = params[0]
        const row = data[p.dataIndex]
        return [
          `${row.productName || '（商品已删除）'}`,
          `退款订单：${row.refundOrderCount} 笔`,
          `退款订单销售额：${money(row.refundSales)}`,
          `总销售额：${money(row.totalSales)}`,
          `占比：${percent(row.refundRate)}`
        ].join('<br/>')
      }
    },
    grid: { left: '120px', right: '40px', bottom: '30px', top: '30px' },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}' },
      splitNumber: 5,
      minInterval: 1
    },
    yAxis: {
      type: 'category',
      data: data.map((d) => wrapLabel(d.productName || '（已删除）')),
      inverse: true
    },
    series: [
      {
        name: '退款订单销售额',
        type: 'bar',
        data: data.map((d) => d.refundSales),
        barWidth: '50%',
        label: {
          show: true,
          position: 'right',
          formatter: (p) => `${p.value} 元 / ${data[p.dataIndex].refundOrderCount} 笔`
        }
      }
    ]
  })
}

/** 商品名过长时折行显示（与销量排行一致的口径） */
function wrapLabel(name) {
  const maxLineLength = 8
  const reg = new RegExp(`.{1,${maxLineLength}}`, 'g')
  const lines = name.match(reg) || []
  return lines.slice(0, 2).join('\n') + (lines.length > 2 ? '…' : '')
}

function fetchTrendData() {
  const [start, end] = trendDateRange.value
  listSalesTrade({ beginCreateTime: start, endCreateTime: end }).then((res) => {
    renderLineChart(res.data)
  })
}

/**
 * 查询销量排行
 */
function fetchTopProduct() {
  const [start, end] = rankDateRange.value
  listSaleTopProduct({ beginCreateTime: start, endCreateTime: end }).then((res) => {
    renderBarChart(res.data)
  })
}

/**
 * 查询销售总额
 */
function fetchSales() {
  const [start, end] = dateRange.value
  listSales({ beginCreateTime: start, endCreateTime: end }).then((res) => {
    saleInfo.value = res.data
  })
}

/** 经营概览：比例由服务端算好（分母为 0 时给 0），这里只格式化显示 */
function fetchOverview() {
  const [start, end] = overviewDateRange.value
  getBusinessOverview({ beginCreateTime: start, endCreateTime: end }).then((res) => {
    overview.value = res.data
  })
}

function fetchRefundTop() {
  const [start, end] = refundDateRange.value
  listRefundTopProduct({ beginCreateTime: start, endCreateTime: end }).then((res) => {
    renderRefundChart(res.data)
  })
}

const saleInfo = ref()
const overview = ref()

function handleQuery() {
  fetchTrendData()
  fetchTopProduct()
  fetchSales()
  fetchOverview()
  fetchRefundTop()
}
handleQuery()
</script>

<style scoped>
/* ECharts 尺寸自适应建议加宽高设定 */
.stat-line {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 22px;
}
.stat-line__label {
  color: var(--el-text-color-secondary);
}
/* 指标下面的补充说明（退款金额、售后单数、买家数），不抢主数字的视觉 */
.stat-hint {
  margin-left: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}
</style>
