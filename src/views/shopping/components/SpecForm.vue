<template>
  <el-form ref="specFormRef" :model="info" :rules="rules" label-position="left" label-width="110px">
    <!-- 规格定义 -->
    <el-form-item label="商品规格">
      <div class="spec-list">
        <el-alert type="info" :closable="false" show-icon class="mb10">
          每个商品最多 3 个规格维度，每个维度至少 1 个规格值。例如「颜色:红/蓝」×「尺码:M/L」= 4 个 SKU。
        </el-alert>
        <div class="spec-wrap" :class="{ 'is-error': !!specNameError(spec, specIndex) }" v-for="(spec, specIndex) in form.specList" :key="specIndex">
          <div class="spec-head">
            <el-select v-model="spec.name" placeholder="如：颜色、尺寸" class="spec-name" filterable allow-create>
              <el-option v-for="item in commonSpecNames" :key="item" :label="item" :value="item" />
            </el-select>
            <el-button icon="remove" @click="removeSpec(specIndex)">删除规格</el-button>
          </div>
          <div class="spec-values">
            <el-tag v-for="(val, valIndex) in spec.values" :key="valIndex" closable @close="removeSpecValue(spec, valIndex)">
              {{ val }}
            </el-tag>
            <el-input v-model="spec.temp" class="spec-input" placeholder="输入规格值后回车" @keyup.enter="addSpecValue(spec, specIndex)" />
          </div>
          <div v-if="specNameError(spec, specIndex)" class="field-error">
            <el-icon><Warning /></el-icon>{{ specNameError(spec, specIndex) }}
          </div>
          <div v-if="!spec.values.length" class="field-tip">
            <el-icon><InfoFilled /></el-icon>「{{ spec.name || '该规格' }}」还没有规格值，不会生成 SKU
          </div>
        </div>
        <el-button icon="plus" type="primary" @click="addSpec()">添加规格</el-button>
      </div>
    </el-form-item>

    <el-divider />

    <!-- SKU 批量设置 -->
    <el-form-item label="批量设置">
      <el-space>
        <el-button link type="primary" @click="handleMultiSet('price')">设置价格</el-button>
        <el-button link type="primary" @click="handleMultiSet('stock')">设置库存</el-button>
        <el-button link type="primary" @click="handleMultiSet('weight')">设置重量</el-button>
      </el-space>
    </el-form-item>

    <!-- SKU 列表（全宽，不缩进） -->
    <div class="sku-section">
      <div class="sku-section__title">SKU 列表（共 {{ skus.length }} 项）</div>
      <el-table :data="skus" border :key="tableKey" style="width: 100%">
        <el-table-column label="ID" prop="skuId" width="80" align="center"></el-table-column>
        <el-table-column v-for="(spec, index) in form.specList" :key="index" :label="spec.name || `规格${index + 1}`" min-width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.specs.find((s) => s.name === spec.name)?.value || '-' }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="规格图片" width="120" align="center">
          <template #default="{ row }">
            <UploadImage v-model="row.imageUrl" :limit="1" :width="'80px'" />
          </template>
        </el-table-column>
        <el-table-column label="价格" width="130" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.price" :min="0" :precision="2" style="width: 110px" controls-position="right" />
            <div v-if="!(row.price > 0)" class="cell-tip cell-tip--error">价格需大于 0</div>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="130" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.stock" :min="0" style="width: 110px" controls-position="right" />
            <div v-if="Number(row.stock) < 0" class="cell-tip cell-tip--error">库存不能为负数</div>
            <div v-else-if="Number(row.stock) === 0" class="cell-tip cell-tip--warning">库存为 0，前台显示售罄</div>
          </template>
        </el-table-column>
        <el-table-column label="重量(KG)" width="130" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.weight" :min="0" :precision="2" style="width: 110px" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" align="center">
          <template #default="scope">
            <el-button type="danger" text icon="delete" @click="removeSku(scope.$index, scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-form>
</template>
<script setup name="SpecInfoForm">
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce } from '@/utils'
const commonSpecNames = ['颜色', '尺寸', '尺码', '版本', '材质', '内存', '容量', '型号', '规格']
const tableKey = ref(0)

// 规格名不能为空、不能重复：同名规格会让「名:值」组合、SKU 表格列与前台规格选择全部串数据
function specNameError(spec, specIndex) {
  const name = (spec.name || '').trim()
  if (!name) {
    return '规格名不能为空'
  }
  const duplicatedIndex = form.specList.findIndex((item, index) => index !== specIndex && (item.name || '').trim() === name)
  if (duplicatedIndex > -1) {
    return `规格名与第 ${duplicatedIndex + 1} 个规格重复，请改名或直接删除其中一个`
  }
  return ''
}
const form = reactive({
  specList: [],
  skus: [],
  // 规格类型 1.单规格 2.多规格
  specType: 2
})
const rules = {}

const props = defineProps({
  specList: {
    type: Array,
    default: () => []
  },
  skus: {
    type: Array,
    default: () => []
  },
  info: {
    type: Object,
    default: () => {
      return {
        type: 1,
        purchaseLimit: {}
      }
    }
  }
})
const emit = defineEmits(['update:specList', 'update:skus'])

/**
 * 添加规格
 */
function addSpec() {
  if (form.specList.length >= 3) {
    ElMessage.warning('最多添加3个规格')
    return
  }
  form.specList.push({ name: '颜色', values: [], temp: '' })
}
/**
 * 删规格维度/规格值会让对应组合消失，保存后这些 SKU 会被后端软删。
 * 如果上面已经填过价格或库存，先提醒一下，避免以为数据还在。
 */
function warnRemovedSkus(removedSkus, action) {
  const affected = removedSkus.filter((sku) => sku.price > 0 || sku.stock > 0)
  if (!affected.length) return
  ElMessage.warning(`${action}会移除 ${affected.length} 个已填价格/库存的 SKU，请检查剩余 SKU 的数据`)
}

/**
 * 删除规格
 * @param specIndex
 */
function removeSpec(specIndex) {
  const name = (form.specList[specIndex]?.name || '').trim()
  const removed = props.skus.filter((sku) => (sku.specs || []).some((s) => s.name === name))
  form.specList.splice(specIndex, 1)
  generateSkus()
  warnRemovedSkus(removed, `删除规格「${name}」`)
}

/**
 * 添加规格值
 */
function addSpecValue(spec, specIndex) {
  const val = form.specList[specIndex].temp.trim()
  if (val && !form.specList[specIndex].values.includes(val)) {
    form.specList[specIndex].values.push(val)
    generateSkus()
  }
  form.specList[specIndex].temp = ''
}
/**
 * 删除规格值
 * @param spec
 * @param index
 */
function removeSpecValue(spec, index) {
  const value = spec.values[index]
  const removed = props.skus.filter((sku) => (sku.specs || []).some((s) => s.name === spec.name && s.value === value))
  spec.values.splice(index, 1)
  generateSkus()
  warnRemovedSkus(removed, `删除规格值「${value}」`)
}

// 监听 specList 变化，自动生成 SKU，使用防抖减少频繁计算
const debouncedGenerateSkus = debounce(generateSkus, 300)
watch(
  () => props.specList,
  (val) => {
    form.specList = val ?? []
  },
  {
    immediate: true
  }
)

// 监听 specList 变化，自动生成 SKU
watch(
  () => form.specList,
  () => {
    debouncedGenerateSkus()
    emit('update:specList', form.specList)
  },
  { deep: true } // 深度监听每个规格和规格值
)

// SKU 生成（笛卡尔积）
// 单规格模式不需要笛卡尔积
function generateSkus() {
  const specs = form.specList.filter((s) => s.name && s.values.length > 0)
  if (specs.length === 0) {
    form.skus = []

    emit('update:skus', [])
    return
  }
  // 生成笛卡尔积
  const combinations = cartesianProduct(specs.map((s) => s.values))

  // 旧数据映射：优先用「颜色:红|尺码:M」精确匹配；
  // 只改规格名时这个键会变，再退一步用「值的顺序」匹配，避免把已填价格/库存的 SKU 当新增、
  // 旧 SKU 被后端软删（值组合本身是唯一的，退化匹配不会串数据）。
  const oldMap = new Map(
    props.skus.map((sku) => [(sku.specs || []).map((s) => `${s.name}:${s.value}`).join('|'), sku])
  )
  const oldMapByValues = new Map(
    props.skus.map((sku) => [(sku.specs || []).map((s) => s.value).join('|'), sku])
  )

  // 生成新 SKU
  form.skus = combinations.map((comb) => {
    const specItems = comb.map((val, i) => ({
      name: specs[i].name,
      value: val
    }))
    const key = specItems.map((s) => `${s.name}:${s.value}`).join('|')
    const matched = oldMap.get(key) || oldMapByValues.get(specItems.map((s) => s.value).join('|'))

    if (matched) {
      // 规格名可能被改过，这里以当前定义为准，同时保留 skuId 让后端按主键更新
      return { ...matched, specs: specItems }
    }

    return {
      specs: specItems,
      price: 0,
      stock: 0,
      imageUrl: '',
      weight: 0
    }
  })
  emit('update:skus', form.skus)
  tableKey.value++ // 触发表格刷新
}
function cartesianProduct(arrays) {
  if (arrays.length === 0) return []
  return arrays.reduce(
    (acc, curr) => {
      const result = []
      for (const a of acc) {
        for (const b of curr) {
          result.push([...a, b])
        }
      }
      return result
    },
    [[]]
  )
}
/**
 *
 * 批量设置 sku 字段
 * @param {'price'|'stock'|'weight'} type
 */
function handleMultiSet(type) {
  if (props.skus.length === 0) {
    ElMessage.warning('还没有生成 SKU，请先配置规格名与规格值')
    return
  }
  const label = { price: '价格', stock: '库存', weight: '重量' }[type]
  // 价格必须大于 0；库存与重量允许为 0（库存为 0 即售罄，重量为 0 表示不计重）
  const isPrice = type === 'price'
  const pattern = isPrice ? /^(0\.(0[1-9]|[1-9]\d?)|[1-9]\d*(\.\d{1,2})?)$/ : type === 'stock' ? /^\d+$/ : /^\d+(\.\d{1,2})?$/
  ElMessageBox.prompt(`将 ${props.skus.length} 个 SKU 的${label}统一设置为`, `批量设置${label}`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: pattern,
    inputErrorMessage: isPrice ? '请输入大于 0 的价格' : type === 'stock' ? '请输入不小于 0 的整数' : '请输入不小于 0 的数值'
  })
    .then(({ value }) => {
      props.skus.forEach((sku) => {
        sku[type] = parseFloat(value)
      })
      ElMessage.success(`已批量设置${label}`)
    })
    // 取消时 ElMessageBox 会 reject，这里吞掉避免未处理的 promise 异常
    .catch(() => {})
}
// 删除 SKU
function removeSku(index, row) {
  props.skus.splice(index, 1)

  ElMessage.success('SKU 已删除')
}
</script>

<style scoped lang="scss">
.mr-2 {
  margin-right: 8px;
}
.ml-2 {
  margin-left: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.el-card__header {
  padding: 10px;
}
.spec-list {
  width: 100%;
}
.spec-wrap {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: var(--el-fill-color-blank);
  &.is-error {
    border-color: var(--el-color-danger);
  }
  .spec-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .spec-name {
    width: 180px;
  }
  .spec-values {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .spec-input {
    width: 200px;
  }
}
.sku-section {
  margin-top: 4px;
  &__title {
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--el-text-color-primary);
  }
}
.field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-color-danger);
}
.field-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cell-tip {
  font-size: 12px;
  line-height: 1.4;
  margin-top: 2px;
  &--error {
    color: var(--el-color-danger);
  }
  &--warning {
    color: var(--el-color-warning);
  }
}
</style>
