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
        <el-button type="primary" v-hasPermi="['shop:skus:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
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
              <div class="spec-editor">
                <div class="spec-row" v-for="(it, idx) in specItems" :key="idx">
                  <el-input v-model="it.name" placeholder="规格名，如 颜色" clearable style="width: 150px" />
                  <span class="spec-sep">:</span>
                  <el-input v-model="it.value" placeholder="规格值，如 红" clearable style="width: 170px" />
                  <el-button v-if="specItems.length > 1" text type="danger" icon="delete" @click="removeSpec(idx)"></el-button>
                </div>
                <el-button text type="primary" icon="plus" @click="addSpec" class="spec-add">添加规格</el-button>
              </div>
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
  </div>
</template>

<script setup name="skus">
import { listSkus, getSkus, addSkus, updateSkus, delSkus } from '@/api/shopping/skus.js'
import { listShoppingProduct } from '@/api/shopping/product.js'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
const ids = ref([])
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
const queryRef = ref()
const productOptions = ref([])
const productLoading = ref(false)

const dictParams = []

function getList() {
  loading.value = true
  listSkus(queryParams).then((res) => {
    const { code, data } = res
    if (code == 200) {
      dataList.value = data.result
      total.value = data.totalNum
      loading.value = false
    }
  })
}

// 远程搜索商品：按名称或编码检索，只取前若干条，避免一次性拉全量
function searchProducts(keyword) {
  productLoading.value = true
  listShoppingProduct({ pageNum: 1, pageSize: 20, productName: keyword || undefined })
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
  single: true,
  multiple: true,
  submitLoading: false,
  form: {},
  rules: {
    productId: [{ required: true, message: '商品不能为空', trigger: 'change' }],
    price: [{ required: true, message: '价格不能为空', trigger: 'blur' }]
  },
  options: {}
})

const { form, rules, options, single, multiple } = toRefs(state)

// 结构化规格：维护 name/value 数组，提交时拼成 "颜色:红;尺寸:XL"
const specItems = ref([{ name: '', value: '' }])
function parseSpec(str) {
  if (!str) return [{ name: '', value: '' }]
  const items = String(str)
    .split(';')
    .map((pair) => {
      const idx = pair.indexOf(':')
      if (idx === -1) return { name: pair.trim(), value: '' }
      return { name: pair.slice(0, idx).trim(), value: pair.slice(idx + 1).trim() }
    })
    .filter((it) => it.name || it.value)
  items.push({ name: '', value: '' })
  return items
}
function addSpec() {
  specItems.value.push({ name: '', value: '' })
}
function removeSpec(idx) {
  specItems.value.splice(idx, 1)
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
  specItems.value = [{ name: '', value: '' }]
  proxy.resetForm('formRef')
}

// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  state.submitLoading = false
  title.value = '添加商品库存'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.skuId || ids.value
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
      specItems.value = parseSpec(data.specCombination)
    }
  })
}

// 添加&修改 表单提交
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      const filled = specItems.value.filter((it) => it.name || it.value)
      if (filled.some((it) => !it.name || !it.value)) {
        ElMessage.warning('规格名和规格值需同时填写')
        return
      }
      form.value.specCombination = filled.map((it) => `${it.name}:${it.value}`).join(';') || null
      state.submitLoading = true

      if (form.value.skuId != undefined && opertype.value === 2) {
        updateSkus(form.value).then((res) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addSkus(form.value)
          .then((res) => {
            proxy.$modal.msgSuccess('新增成功')
            open.value = false
            getList()
          })
          .finally(() => {
            setTimeout(() => {
              state.submitLoading = false
            }, 800)
          })
      }
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.skuId || ids.value

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

<style lang="scss" scoped>
.spec-editor {
  width: 100%;
}
.spec-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.spec-sep {
  color: var(--el-text-color-secondary);
}
.spec-add {
  padding-left: 0;
}
</style>
