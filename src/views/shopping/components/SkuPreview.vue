<template>
  <div class="sku-preview">
    <!-- 异常清单：提交前先看这里 -->
    <el-alert
      v-if="errorIssues.length"
      type="error"
      :closable="false"
      show-icon
      class="mb10"
      title="还有问题需要处理，处理完才能提交">
      <ul class="issue-list">
        <li v-for="(issue, index) in errorIssues" :key="'e' + index">
          {{ issue.text }}
          <el-button v-if="issue.tab" type="primary" link @click="emit('jump', issue.tab)">去处理</el-button>
        </li>
      </ul>
    </el-alert>
    <el-alert
      v-else-if="warningIssues.length"
      type="warning"
      :closable="false"
      show-icon
      class="mb10"
      title="没有阻塞提交的问题，但下面几项建议再确认一下">
      <ul class="issue-list">
        <li v-for="(issue, index) in warningIssues" :key="'w' + index">
          {{ issue.text }}
          <el-button v-if="issue.tab" type="primary" link @click="emit('jump', issue.tab)">去处理</el-button>
        </li>
      </ul>
    </el-alert>
    <el-alert v-else type="success" :closable="false" show-icon class="mb10" title="校验通过，可以提交" />

    <!-- 商品摘要 -->
    <el-descriptions :column="3" border size="small" class="mb10">
      <el-descriptions-item label="商品名称">
        <span :class="{ 'text-danger': !info?.productName }">{{ info?.productName || '未填写' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="商品分类">
        <span :class="{ 'text-danger': !info?.categoryId }">{{ categoryName || '未选择' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="售卖状态">
        <dict-tag v-if="saleStatusOptions?.length" :options="saleStatusOptions" :value="info?.saleStatus" />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="规格类型">
        <el-tag size="small" :type="info?.specType === 1 ? 'info' : 'success'" effect="plain">
          {{ info?.specType === 1 ? '单规格' : '多规格' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="商品限购">
        <span v-if="info?.purchaseLimit?.limit">
          总限购 {{ info.purchaseLimit.totalLimit || 0 }} 件/人，每单限购 {{ info.purchaseLimit.singleLimit || 0 }} 件
        </span>
        <span v-else>不限购</span>
      </el-descriptions-item>
      <el-descriptions-item label="商品主图">
        <ImagePreview v-if="info?.mainImage" :src="info.mainImage" width="60px" height="60px" />
        <span v-else class="text-danger">未上传</span>
      </el-descriptions-item>
    </el-descriptions>

    <!-- SKU 汇总 -->
    <el-row :gutter="10" class="mb10">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">SKU 数量</div>
          <div class="stat-card__value">{{ skus.length }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">价格区间</div>
          <div class="stat-card__value">{{ priceRangeText }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">总库存</div>
          <div class="stat-card__value">{{ totalStock }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">异常 SKU</div>
          <div class="stat-card__value" :class="{ 'text-danger': abnormalCount > 0 }">{{ abnormalCount }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- SKU 预览表 -->
    <div class="preview-table__title">
      SKU 明细（共 {{ skus.length }} 项）
      <span class="text-muted" style="font-size: 12px; font-weight: 400">
        红色行＝价格或库存异常，黄色行＝库存为 0（前台将显示售罄）
      </span>
    </div>
    <el-table :data="skus" border size="small" :row-class-name="rowClassName" max-height="420">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column v-for="(spec, index) in displaySpecList" :key="index" :label="spec.name || `规格${index + 1}`" min-width="110">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ specValue(row, spec.name) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="规格图片" width="80" align="center">
        <template #default="{ row }">
          <ImagePreview v-if="row.imageUrl" :src="row.imageUrl" width="40px" height="40px" />
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="110" align="center">
        <template #default="{ row }">
          <span :class="{ 'text-danger': !(row.price > 0) }">{{ row.price > 0 ? formatMoney(row.price) : '未填写' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" width="100" align="center">
        <template #default="{ row }">
          <span :class="row.stock < 0 ? 'text-danger' : row.stock === 0 ? 'text-warning' : ''">{{ row.stock }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重量(KG)" width="100" align="center">
        <template #default="{ row }">{{ row.weight || 0 }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="skuStatus(row).type" effect="plain">{{ skuStatus(row).text }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="SkuPreview">
import { formatMoney } from '@/utils/money'

const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  specList: {
    type: Array,
    default: () => []
  },
  skus: {
    type: Array,
    default: () => []
  },
  // 由父组件汇总的问题清单：[{ level: 'error' | 'warning', tab, text }]
  issues: {
    type: Array,
    default: () => []
  },
  categoryOptions: {
    type: Array,
    default: () => []
  },
  saleStatusOptions: {
    type: Array,
    default: () => []
  }
})
// jump 回传问题所在的标签页 name（base/sku），由父组件切换 el-tabs
const emit = defineEmits(['jump'])

const errorIssues = computed(() => props.issues.filter((item) => item.level === 'error'))
const warningIssues = computed(() => props.issues.filter((item) => item.level !== 'error'))

// 单规格只有一条「规格:默认」组合，展示规格维度列没有意义
const displaySpecList = computed(() => (props.info?.specType === 1 ? [] : props.specList))

// 分类树里按 id 反查名称，查不到就退回显示 id
const categoryName = computed(() => {
  const id = props.info?.categoryId
  if (id === undefined || id === null || id === '') return ''
  return findCategoryName(props.categoryOptions, id) || `分类 #${id}`
})

function findCategoryName(tree, id) {
  for (const node of tree || []) {
    if (node.categoryId === id) return node.name
    const found = findCategoryName(node.children, id)
    if (found) return found
  }
  return ''
}

const priceRangeText = computed(() => {
  const prices = props.skus.map((sku) => Number(sku.price) || 0).filter((price) => price > 0)
  if (!prices.length) return '未填写'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? `￥${min}` : `￥${min} ~ ￥${max}`
})

const totalStock = computed(() => props.skus.reduce((sum, sku) => sum + (Number(sku.stock) || 0), 0))

const abnormalCount = computed(() => props.skus.filter((sku) => abnormalSku(sku)).length)

function abnormalSku(sku) {
  return !(sku.price > 0) || Number(sku.stock) < 0
}

function skuStatus(sku) {
  if (!(sku.price > 0)) return { text: '价格异常', type: 'danger' }
  if (Number(sku.stock) < 0) return { text: '库存异常', type: 'danger' }
  if (Number(sku.stock) === 0) return { text: '库存为 0', type: 'warning' }
  return { text: '正常', type: 'success' }
}

function rowClassName({ row }) {
  if (abnormalSku(row)) return 'preview-row-error'
  if (Number(row.stock) === 0) return 'preview-row-warning'
  return ''
}

// SKU 行可能来自旧数据，specs 结构不一定完整
function specValue(row, name) {
  return row.specs?.find((item) => item.name === name)?.value || '-'
}
</script>

<style scoped lang="scss">
.issue-list {
  margin: 4px 0 0;
  padding-left: 18px;
  line-height: 1.8;
}
// ImagePreview 不传尺寸时会按原图渲染，会把描述表格撑变形；这里再兜一层宽度上限
::deep(.el-descriptions__label) {
  white-space: nowrap;
}
::deep(.el-descriptions__cell) {
  vertical-align: middle;
}
::deep(.el-descriptions__cell .el-image) {
  max-width: 120px;
  max-height: 120px;
}
.stat-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 10px 12px;
  background: var(--el-fill-color-blank);
  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
  }
  &__value {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}
.preview-table__title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}
::deep(.preview-row-error) {
  --el-table-tr-bg-color: var(--el-color-danger-light-9, #fef0f0);
}
::deep(.preview-row-warning) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9, #fdf6ec);
}
</style>
