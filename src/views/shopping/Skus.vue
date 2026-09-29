<!--
 * @Descripttion: (商品库存/SKU/mms_skus)
 * @Author: (admin)
 * @Date: (2026-07-26)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="商品编码" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="输入商品编码检索" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品" prop="productId">
        <el-select
          v-model="queryParams.productId"
          placeholder="输入商品名称/编码搜索"
          clearable
          filterable
          remote
          :remote-method="searchProducts"
          :loading="productLoading"
          @change="handleQuery()"
          style="width: 200px">
          <el-option
            v-for="item in productOptions"
            :key="item.productId"
            :label="item.productName + (item.productCode ? ' (' + item.productCode + ')' : '')"
            :value="item.productId" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <!-- SKU 由商品编辑页的规格定义全量生成，这里只做"定义与 SKU 不一致"时的补齐 -->
        <el-button type="primary" v-hasPermi="['shop:skus:add']" plain icon="plus" @click="handleFillMissing"> 补齐缺失规格 </el-button>
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
      <el-table-column prop="skuId" label="SkuId" align="center" v-if="columns.showColumn('skuId')" />
      <el-table-column prop="productId" label="商品" align="center" v-if="columns.showColumn('productId')">
        <template #default="scope">
          <div>{{ scope.row.productName || scope.row.productId }}</div>
          <div v-if="scope.row.productCode" class="text-muted" style="font-size: 12px">{{ scope.row.productCode }}</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="specCombination"
        label="规格组合"
        align="center"
        :show-overflow-tooltip="true"
        v-if="columns.showColumn('specCombination')" />
      <el-table-column prop="price" label="价格" align="center" v-if="columns.showColumn('price')" />
      <el-table-column prop="stock" label="可售库存" align="center" v-if="columns.showColumn('stock')" />
      <el-table-column prop="salesVolume" label="销量" align="center" v-if="columns.showColumn('salesVolume')" />
      <el-table-column prop="imageUrl" label="图片" align="center" width="80" v-if="columns.showColumn('imageUrl')">
        <template #default="scope">
          <ImagePreview :src="scope.row.imageUrl" v-if="scope.row.imageUrl" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            icon="edit"
            title="编辑"
            v-hasPermi="['shop:skus:edit']"
            @click="handleUpdate(scope.row)"></el-button>
          <el-button
            type="danger"
            size="small"
            icon="delete"
            title="删除"
            v-hasPermi="['shop:skus:delete']"
            @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :lg="24">
            <el-form-item label="商品" prop="productId">
              <el-select
                v-model="form.productId"
                placeholder="输入商品名称搜索"
                filterable
                remote
                :remote-method="searchProducts"
                :loading="productLoading"
                :disabled="opertype === 2"
                style="width: 100%">
                <el-option v-for="item in productOptions" :key="item.productId" :label="item.productName" :value="item.productId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="规格组合" prop="specCombination">
              <!-- 规格组合是 SKU 的身份标识：库存、销量、订单项快照都挂在这个 SkuId 上，
                   改组合会让历史数据错位，还可能撞上已是别的 SKU 的组合，因此这里只读。
                   需要变更请先删除该 SKU，再用「补齐缺失规格」重建；规格值本身在商品编辑页维护。 -->
              <el-text v-if="form.specCombination">{{ form.specCombination }}</el-text>
              <el-text v-else type="info" size="small">该商品未定义规格</el-text>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="可售库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="重量(kg)" prop="weight">
              <el-input-number v-model="form.weight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="图片" prop="imageUrl">
              <UploadImage v-model="form.logo" :data="{ uploadType: 1 }" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" :loading="state.submitLoading" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- 补齐缺失规格组合：规格定义里有、但还没有 SKU 的组合 -->
    <el-dialog title="补齐缺失规格组合" draggable v-model="missingOpen" width="720px">
      <el-alert type="info" :closable="false" class="mb10">
        商品「{{ missingProductName }}」有 {{ missingCombinations.length }} 个规格组合还没有 SKU，填写价格后一次创建。
      </el-alert>
      <el-table :data="missingCombinations" max-height="360" border>
        <el-table-column prop="combination" label="规格组合" show-overflow-tooltip />
        <el-table-column label="价格" width="170">
          <template #default="{ row }">
            <el-input-number v-model="row.price" :min="0.01" :precision="2" :step="1" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="可售库存" width="170">
          <template #default="{ row }">
            <el-input-number v-model="row.stock" :min="0" :step="1" style="width: 100%" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button text @click="missingOpen = false">取消</el-button>
        <el-button type="primary" :loading="missingSubmitting" @click="submitMissing">创建全部</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="skus">
import { listSkus, getSkus, addSkus, updateSkus, delSkus } from '@/api/shopping/skus.js'
import { listShoppingProduct, getShoppingProduct } from '@/api/shopping/product.js'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: '',
  sortType: 'asc',
  productId: undefined,
  productCode: undefined
})
const columns = ref([
  { visible: true, align: 'center', type: '', prop: 'skuId', label: 'SkuId' },
  { visible: true, align: 'center', type: '', prop: 'productId', label: '商品', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'specCombination', label: '规格组合', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'price', label: '价格' },
  { visible: true, align: 'center', type: '', prop: 'stock', label: '可售库存' },
  { visible: true, align: 'center', type: '', prop: 'salesVolume', label: '销量' },
  { visible: true, align: 'center', type: '', prop: 'imageUrl', label: '图片', showOverflowTooltip: true }
])
const total = ref(0)
const dataList = ref([])
const productOptions = ref([])
const productLoading = ref(false)

function getList() {
  loading.value = true
  listSkus(queryParams)
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

// 远程搜索商品：按名称或编码检索，只取前若干条，避免一次性拉全量
function searchProducts(keyword) {
  productLoading.value = true
  const params = { pageNum: 1, pageSize: 20 }
  if (keyword) {
    params.productName = keyword
    params.productCode = keyword
  }

  listShoppingProduct(params)
    .then((res) => {
      if (res.code == 200) {
        productOptions.value = res.data.result || []
      }
    })
    .finally(() => {
      productLoading.value = false
    })
}

// 确保指定商品出现在下拉选项中（用于编辑/筛选回显名称）
function ensureProductOption(productId, productName) {
  if (productId == null) return
  const exists = productOptions.value.some((p) => p.productId === productId)
  if (!exists) {
    productOptions.value = [{ productId, productName: productName || productId }, ...productOptions.value]
  }
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  proxy.resetForm('queryRef')
  queryParams.productId = undefined
  queryParams.productCode = undefined
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

/*************** form操作 ***************/
const formRef = ref()
const title = ref('')
// 操作类型 1、add 2、edit 3、view
const opertype = ref(0)
const open = ref(false)
const state = reactive({
  submitLoading: false,
  form: {},
  rules: {
    productId: [{ required: true, message: '商品不能为空', trigger: 'change' }],
    price: [{ required: true, message: '价格不能为空', trigger: 'blur' }]
  }
})

const { form, rules } = toRefs(state)

// 补齐缺失规格：SKU 由商品编辑页的规格定义全量生成，这里只补"定义里有、但还没建 SKU"的组合
const missingOpen = ref(false)
const missingSubmitting = ref(false)
const missingProductName = ref('')
const missingCombinations = ref([])

// 计算尚无 SKU 的规格组合（规格定义笛卡尔积 - 已有组合）
function calcMissingCombinations(defs, existingSkus) {
  const usableDefs = (defs || []).filter((d) => d.name && (d.values || []).length > 0)
  if (usableDefs.length === 0) {
    return []
  }

  // 笛卡尔积
  let combos = [[]]
  for (const def of usableDefs) {
    const next = []
    for (const combo of combos) {
      for (const value of def.values) {
        next.push([...combo, { name: def.name, value }])
      }
    }
    combos = next
  }

  const existed = new Set((existingSkus || []).map((sku) => sku.specCombination))
  return combos
    .map((pairs) => pairs.map((p) => `${p.name}:${p.value}`).join(';'))
    .filter((combination) => !existed.has(combination))
    .map((combination) => ({ combination }))
}

// 补齐按钮：必须先按商品筛选，否则不知道该补谁
function handleFillMissing() {
  if (!queryParams.productId) {
    ElMessage.warning('请先在查询条件中选择商品，再执行补齐')
    return
  }

  getShoppingProduct(queryParams.productId).then((res) => {
    if (res.code != 200) {
      return
    }
    const product = res.data || {}
    const missing = calcMissingCombinations(product.spec, product.skus)
    if (missing.length === 0) {
      ElMessage.info('该商品的规格组合已全部创建，无需补齐')
      return
    }

    missingProductName.value = product.productName || ''
    missingCombinations.value = missing.map((item) => ({ ...item, price: undefined, stock: 0 }))
    missingOpen.value = true
  })
}

// 一次创建全部缺失组合（逐个提交，任一失败即中断并保留已成功的部分）
async function submitMissing() {
  const invalid = missingCombinations.value.find((item) => !(item.price > 0))
  if (invalid) {
    ElMessage.warning(`请填写「${invalid.combination}」的价格（需大于 0）`)
    return
  }

  if (!queryParams.productId) {
    ElMessage.warning('请先选择商品，再补齐缺失规格')
    return
  }

  missingSubmitting.value = true
  try {
    for (const item of missingCombinations.value) {
      await addSkus({
        productId: queryParams.productId,
        specCombination: item.combination,
        price: item.price,
        stock: item.stock,
        weight: 0
      })
    }
    ElMessage.success(`已创建 ${missingCombinations.value.length} 个 SKU`)
    missingOpen.value = false
    getList()
  } catch (error) {
    ElMessage.error(error?.message || '创建缺失 SKU 失败')
  } finally {
    missingSubmitting.value = false
  }
}

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    skuId: null,
    productId: null,
    specCombination: null,
    price: 0,
    stock: 0,
    weight: 0,
    imageUrl: null
  }
  state.submitLoading = false
  proxy.resetForm('formRef')
}

// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.skuId
  // 编辑时把当前商品补进下拉选项，保证名称正常回显
  ensureProductOption(row.productId, row.productName)
  getSkus(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改商品库存'
      opertype.value = 2

      form.value = {
        ...data
      }
    }
  })
}

// 添加&修改 表单提交
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      // 规格组合只读：原样提交（form.value.specCombination 来自详情接口，不参与重算，
      // 也就不存在"规格定义加载失败把组合清空"的风险）
      state.submitLoading = true

      if (form.value.skuId != undefined && opertype.value === 2) {
        updateSkus(form.value)
          .then(() => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          })
          .finally(() => {
            state.submitLoading = false
          })
      } else {
        addSkus(form.value)
          .then(() => {
            proxy.$modal.msgSuccess('新增成功')
            open.value = false
            getList()
          })
          .finally(() => {
            state.submitLoading = false
          })
      }
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.skuId

  proxy
    .$confirm('是否确认删除SKU编号为"' + Ids + '"的数据项？', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(function () {
      return delSkus(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

searchProducts()
handleQuery()
</script>
