<!--
 * @Descripttion: (商品管理/shopping_product)
 * @Author: (admin)
 * @Date: (2025-05-23)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <!-- <el-form-item label="商品Id" prop="productId">
        <el-input v-model="queryParams.productId" placeholder="请输入商品Id" />
      </el-form-item>
      <el-form-item label="商品名" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入商品名" />
      </el-form-item>
      <el-form-item label="商品编码" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="请输入商品编码" />
      </el-form-item> -->

      <el-form-item label="搜索">
        <el-input
          v-model="searchValue"
          label-width="130px"
          clearable
          placeholder="请输入搜索内容"
          style="max-width: 600px"
          class="input-with-select">
          <template #prepend>
            <el-select v-model="searchType" placeholder="请选择字段" style="width: 115px">
              <el-option label="商品ID" value="productId" />
              <el-option label="商品名" value="productName" />
              <el-option label="商品编码" value="productCode" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>

      <BrandSelect v-model="queryParams.brandId" />
      <el-form-item label="分类">
        <el-cascader
          class="w100"
          :options="categoryOptions"
          :props="{ checkStrictly: true, value: 'categoryId', label: 'name', emitPath: false }"
          placeholder="请选择上级分类"
          clearable
          v-model="queryParams.categoryId">
          <template #default="{ node, data }">
            <span>{{ data.name }}</span>
            <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item label="商品状态" prop="saleStatus">
        <el-radio-group v-model="queryParams.saleStatus" @change="handleQuery">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in dictStore.saleStatusOptions" :key="item.dictValue" :value="parseInt(item.dictValue)">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="添加时间">
        <el-date-picker
          v-model="dateRangeAddTime"
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
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['shop:product:add']" plain icon="plus" @click="handleAdd"> 新增商品 </el-button>
      </el-col>
      <el-col :span="1.5" v-if="String(queryParams.saleStatus) !== '1'">
        <el-button type="success" plain icon="Top" :disabled="multiple" @click="handleMulti('up')" v-hasPermi="['shop:product:edit']">
          批量上架
        </el-button>
      </el-col>
      <el-col :span="1.5" v-if="String(queryParams.saleStatus) !== '0'">
        <el-button type="danger" plain icon="Bottom" :disabled="multiple" @click="handleMulti('down')" v-hasPermi="['shop:product:edit']">
          批量下架
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['shop:product:delete']">
          {{ $t('btn.delete') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['shop:product:export']">
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
      @selection-change="handleSelectionChange"
      @sort-change="sortChange">
      <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
      <el-table-column prop="productId" label="商品ID" align="center" sortable v-if="columns.showColumn('productId')" />
      <el-table-column prop="mainImage" label="封面" align="center" width="60" v-if="columns.showColumn('mainImage')">
        <template #default="scope">
          <ImagePreview :src="scope.row.mainImage"></ImagePreview>
        </template>
      </el-table-column>

      <el-table-column prop="productName" label="商品名" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('productName')">
      </el-table-column>
      <!-- 类型：虚拟商品的下单流程与实物不同（免地址、免运费、付款即完成），列表里要能一眼区分 -->
      <el-table-column prop="productType" label="类型" align="center" width="90" v-if="columns.showColumn('productType')">
        <template #default="{ row }">
          <el-tag :type="row.productType === 2 ? 'warning' : 'info'" effect="plain">
            {{ row.productType === 2 ? '虚拟' : '实物' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="introduce" label="卖点" align="center" v-if="columns.showColumn('introduce')">
        <template #default="{ row }">
          <el-text line-clamp="2">
            {{ row.introduce }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column prop="categoryId" label="分类/品牌" align="center" v-if="columns.showColumn('categoryId')">
        <template #default="{ row }">
          <div v-if="row.category">
            <el-tag>分类：{{ row.category.name }} </el-tag>
          </div>
          <div v-if="row.brand">
            <el-tag type="warning">品牌：{{ row.brand.name }}</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="specSummary" label="规格" v-if="columns.showColumn('specSummary')"></el-table-column>
      <el-table-column prop="price" label="价格" align="center" sortable v-if="columns.showColumn('price')">
        <template #default="{ row }"> {{ formatMoneyRange(row.price, row.maxPrice) }} </template>
      </el-table-column>
      <el-table-column prop="stock" label="总库存" align="center" />
      <el-table-column prop="totalSalesVolume" label="总销量" sortable align="center" />
      <el-table-column prop="sortId" label="排序ID" align="center" sortable width="90" v-if="columns.showColumn('sortId')">
        <template #default="scope">
          <span title="数字越大排名越靠前" v-show="editIndex != scope.$index" @click="editCurrRow(scope.$index)">{{ scope.row.sortId }}</span>
          <el-input
            title="数字越大排名越靠前"
            :ref="setColumnsRef"
            v-show="editIndex == scope.$index"
            v-model="scope.row.sortId"
            @blur="editIndex = -1"
            @keyup.enter.native="handleChangeSort(scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="saleStatus" label="销售状态" align="center">
        <template #default="scope">
          <dict-tag :options="dictStore.saleStatusOptions" :value="scope.row.saleStatus" />
        </template>
      </el-table-column>
      <el-table-column prop="addTime" label="添加时间" :show-overflow-tooltip="true" v-if="columns.showColumn('addTime')" />
      <el-table-column label="操作" width="110">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            icon="edit"
            title="编辑"
            v-hasPermi="['shop:product:edit']"
            @click="handleUpdate(scope.row)"></el-button>
          <el-button
            type="danger"
            size="small"
            icon="delete"
            title="删除"
            v-hasPermi="['shop:product:delete']"
            @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- <ProductEdit ref="formRef" @success="handleQuery()"></ProductEdit> -->
  </div>
</template>

<script setup name="product">
import { listShoppingProduct, delShoppingProduct, changeSort, operateShoppingProduct } from '@/api/shopping/product.js'
import { formatMoneyRange } from '@/utils/money'
import { treelistCategory } from '@/api/shopping/category.js'

// import ProductEdit from './components/ProductEdit.vue'
import BrandSelect from './components/BrandSelect.vue'
import useDictStore from '@/store/modules/dict'
import router from '@/router'

const route = useRoute()
const { proxy } = getCurrentInstance()
const ids = ref([])
const multiple = ref(true)
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: undefined,
  productCode: undefined,
  saleStatus: 1,
  categoryId: undefined,
  productId: undefined,
  brandId: undefined
})
const searchType = ref('')
const searchValue = ref(undefined)
const dictStore = useDictStore()
const columns = ref([
  { visible: true, prop: 'productId', label: '商品ID' },
  { visible: true, prop: 'productName', label: '商品名' },
  { visible: true, prop: 'productType', label: '类型' },
  { visible: true, prop: 'introduce', label: '卖点' },
  { visible: true, prop: 'categoryId', label: '商品分类' },
  { visible: true, prop: 'price', label: '价格' },
  { visible: false, prop: 'specSummary', label: '规格汇总' },
  // { visible: true,   type: 'img', prop: 'imageUrl', label: '介绍图片地址' },
  { visible: true, prop: 'sortId', label: '排序ID' },
  { visible: false, prop: 'addTime', label: '添加时间' }
])
const total = ref(0)
const dataList = ref([])
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

// 添加时间时间范围
const dateRangeAddTime = ref([])

function getList() {
  // 清空这三个字段
  queryParams.productId = undefined
  queryParams.productName = undefined
  queryParams.productCode = undefined
  proxy.addDateRange(queryParams, dateRangeAddTime.value, 'AddTime')
  loading.value = true
  // 设置被选中的字段
  if (searchType.value && searchValue.value) {
    queryParams[searchType.value] = searchValue.value
  }
  listShoppingProduct(queryParams)
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

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  // 添加时间时间范围
  dateRangeAddTime.value = []
  searchType.value = ''
  searchValue.value = ''
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
const editIndex = ref(-1)
const columnRefs = ref([])
const setColumnsRef = (el) => {
  if (el) {
    columnRefs.value.push(el)
  }
}
// 显示编辑排序
function editCurrRow(index) {
  editIndex.value = index

  setTimeout(() => {
    columnRefs.value[index].focus()
  }, 100)
}
// 保存排序
function handleChangeSort(info) {
  editIndex.value = -1

  changeSort({ value: info.sortId, id: info.productId }).then(() => {
    handleQuery()
    proxy.$modal.msgSuccess('修改成功')
  })
}

// 添加商品
function handleAdd() {
  router.push({
    path: './ProductEdit'
  })
}
// 修改商品
function handleUpdate(row) {
  const id = row.productId
  router.push({
    path: './ProductEdit',
    query: {
      id: id
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.productId || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(function () {
      return delShoppingProduct(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

/**
 * 商品批量上架下架
 * @param type up/down
 */
function handleMulti(type) {
  const Ids = ids.value

  proxy
    .$confirm(`是否确认【${type == 'up' ? '上架' : '下架'}】商品编号为${Ids}的数据项？`, '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(() => {
      return operateShoppingProduct(Ids, type)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('操作成功')
    })
}

// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出商品数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await proxy.downFile('/shopping/product/export', { ...queryParams })
    })
}
/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.productId)

  multiple.value = !selection.length
}
function checkSelectable(row) {
  return true
}
const categoryOptions = ref([])
treelistCategory().then((res) => {
  categoryOptions.value = res.data
})

handleQuery()

watch(
  () => route.query.refresh,
  (val) => {
    if (val === '1') {
      handleQuery()
      router.replace({ query: { ...route.query, refresh: undefined } })
    }
  }
)
</script>
