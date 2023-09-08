<!--
 * @Descripttion: (文章目录/articleCategory)
 * @version: (1.0)
 * @Author: (zr)
 * @Date: (2022-05-13)
 * @LastEditors: (zr)
 * @LastEditTime: (2022-05-13)
-->
<template>
  <div class="app-container">
    <!-- :model属性用于表单验证使用 比如下面的el-form-item 的 prop属性用于对表单值进行验证操作 -->
    <!-- <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form> -->
    <!-- 工具区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['articlecategory:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" v-hasPermi="['articlecategory:delete']" plain icon="delete" @click="handleDelete">
          {{ $t('btn.delete') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['articlecategory:export']">
          {{ $t('btn.export') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据区域 -->
    <el-table
      v-if="refreshTable"
      :data="dataList"
      v-loading="loading"
      ref="tableRef"
      border
      highlight-current-row
      @selection-change="handleSelectionChange"
      :default-expand-all="isExpandAll"
      row-key="categoryId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="目录名" :show-overflow-tooltip="true" />
      <el-table-column prop="categoryId" label="目录id" align="center" />
      <el-table-column prop="createTime" label="添加时间" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="parentId" label="父级id" align="center" />

      <el-table-column label="操作" align="center" width="140">
        <template #default="scope">
          <el-button v-hasPermi="['articlecategory:edit']" type="success" icon="edit" title="编辑" @click="handleUpdate(scope.row)"></el-button>
          <el-button v-hasPermi="['articlecategory:delete']" type="danger" icon="delete" title="删除" @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改文章目录对话框 -->
    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :lg="24" v-if="opertype == 2">
            <el-form-item label="目录id">{{ form.categoryId }}</el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="目录名" prop="name">
              <el-input v-model="form.name" placeholder="请输入目录名" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="父级id" prop="parentId">
              <el-cascader
                class="w100"
                :options="dataList"
                :props="{ checkStrictly: true, value: 'categoryId', label: 'name', emitPath: false }"
                placeholder="请选择上级菜单"
                clearable
                v-model="form.parentId">
                <template #default="{ node, data }">
                  <span>{{ data.name }}</span>
                  <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                </template>
              </el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
          <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="articlecategory">
import {
  treelistArticleCategory,
  addArticleCategory,
  delArticleCategory,
  updateArticleCategory,
  getArticleCategory,
  exportArticleCategory
} from '@/api/article/articlecategory.js'

const { proxy } = getCurrentInstance()
// 是否展开，默认全部折叠
const isExpandAll = ref(false)
const refreshTable = ref(true)
//展开/折叠操作
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

// 选中categoryId数组数组
const ids = ref([])
// 非单选禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 遮罩层
const loading = ref(false)
// 显示搜索条件
const showSearch = ref(true)
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: undefined,
  sortType: undefined
})
// 弹出层标题
const title = ref('')
// 操作类型 1、add 2、edit
const opertype = ref(0)
// 是否显示弹出层
const open = ref(false)
// 表单参数
const state = reactive({
  form: {},
  rules: {
    name: [{ required: true, message: '目录名不能为空', trigger: 'blur' }]
  }
})

const { form, rules } = toRefs(state)
// 总记录数
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const formRef = ref()

var dictParams = []

function getList() {
  loading.value = true
  treelistArticleCategory(queryParams).then((res) => {
    if (res.code == 200) {
      //dataList.value = res.data.result
      //total.value = res.data.totalNum
      dataList.value = res.data
      loading.value = false
    }
  })
}

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    name: undefined,
    parentId: 0
  }
  proxy.resetForm('formRef')
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 添加
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加'
  opertype.value = 1
}

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.categoryId || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？')
    .then(function () {
      return delArticleCategory(Ids)
    })
    .then(() => {
      handleQuery()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.categoryId || ids.value
  getArticleCategory(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改数据'
      opertype.value = 2

      form.value = {
        ...data
      }
    }
  })
}

// 表单提交
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.categoryId != undefined && opertype.value === 2) {
        updateArticleCategory(form.value)
          .then((res) => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          })
          .catch(() => {})
      } else {
        addArticleCategory(form.value)
          .then((res) => {
            proxy.$modal.msgSuccess('新增成功')
            open.value = false
            getList()
          })
          .catch((err) => {
            //TODO 错误逻辑
          })
      }
    }
  })
}

// 重置查询操作
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出所有文章目录数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return exportArticleCategory(queryParams)
    })
    .then((response) => {
      proxy.download(response.data.path)
    })
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.categoryId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 自定义排序
function sortChange(column) {
  if (column.prop == null || column.order == null) {
    queryParams.sort = undefined
    queryParams.sortType = undefined
  } else {
    queryParams.sort = column.prop
    queryParams.sortType = column.order
  }

  handleQuery()
}

handleQuery()
</script>
