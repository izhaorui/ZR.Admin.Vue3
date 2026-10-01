<!--
 * @Descripttion: (品牌表/mms_brand)
 * @Author: (admin)
 * @Date: (2025-05-29)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="品牌名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入品牌名" />
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['shop:brand:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['shop:brand:export']">
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
      <el-table-column prop="id" label="Id" align="center" v-if="columns.showColumn('id')" />
      <el-table-column prop="name" label="品牌名" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('name')" />
      <el-table-column prop="logo" label="品牌logo" align="center" width="80" v-if="columns.showColumn('logo')">
        <template #default="scope">
          <ImagePreview :src="scope.row.logo" v-if="scope.row.logo"></ImagePreview>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="品牌介绍" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('description')" />
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            icon="edit"
            title="编辑"
            v-hasPermi="['shop:brand:edit']"
            @click="handleUpdate(scope.row)"></el-button>
          <el-button
            type="danger"
            size="small"
            icon="delete"
            title="删除"
            v-hasPermi="['shop:brand:delete']"
            @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :lg="24">
            <el-form-item label="品牌名" prop="name">
              <el-input v-model="form.name" placeholder="请输入品牌名" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="品牌logo" prop="logo">
              <UploadImage v-model="form.logo" :data="{ uploadType: 1 }" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="品牌介绍" prop="description">
              <el-input v-model="form.description" placeholder="请输入品牌介绍" />
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

<script setup name="brand">
import { listMmsBrand, addMmsBrand, delMmsBrand, updateMmsBrand, getMmsBrand } from '@/api/shopping/brand.js'
const { proxy } = getCurrentInstance()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: '',
  sortType: 'asc',
  name: undefined
})
const columns = ref([
  { visible: true, align: 'center', type: '', prop: 'id', label: 'Id' },
  { visible: true, align: 'center', type: '', prop: 'name', label: '品牌名', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'logo', label: '品牌logo', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'description', label: '品牌介绍', showOverflowTooltip: true }
  //{ visible: false, prop: 'actions', label: '操作', type: 'slot', width: '160' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

var dictParams = []

function getList() {
  loading.value = true
  listMmsBrand(queryParams)
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
    name: [{ required: true, message: '品牌名不能为空', trigger: 'blur' }]
  },
  options: {}
})

const { form, rules, options, single, multiple } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    id: null,
    name: null,
    logo: null,
    description: null
  }
  proxy.resetForm('formRef')
}

// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  state.submitLoading = false
  title.value = '添加品牌表'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getMmsBrand(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改品牌表'
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
      state.submitLoading = true

      const isEdit = form.value.id != undefined && opertype.value === 2
      const request = isEdit ? updateMmsBrand(form.value) : addMmsBrand(form.value)
      request
        .then(() => {
          proxy.$modal.msgSuccess(isEdit ? '修改成功' : '新增成功')
          open.value = false
          getList()
        })
        .finally(() => {
          state.submitLoading = false
        })
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(function () {
      return delMmsBrand(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出品牌表数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await proxy.downFile('/shopping/Brand/export', { ...queryParams })
    })
}

handleQuery()
</script>
