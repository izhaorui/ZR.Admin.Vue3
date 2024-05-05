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
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item>
        <el-radio-group v-model="queryParams.categoryType" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in categoryTypeOptions" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item> -->
    </el-form>

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
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
      :default-expand-all="isExpandAll"
      row-key="categoryId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="目录名" :show-overflow-tooltip="true" />
      <el-table-column prop="icon" label="图标" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <svg-icon :name="row.icon" v-if="row.icon"></svg-icon>
          {{ row.icon }}
        </template>
      </el-table-column>
      <el-table-column prop="bgImg" label="背景" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <image-preview :src="row.bgImg" split=","></image-preview>
        </template>
      </el-table-column>
      <el-table-column prop="categoryType" label="分类" align="center">
        <template #default="{ row }">
          <dict-tag :options="categoryTypeOptions" :value="row.categoryType"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column prop="categoryId" label="目录id" sortable align="center" />
      <el-table-column prop="orderNum" label="排序" sortable align="center">
        <template #default="scope">
          <span v-show="editIndex != scope.row.categoryId" @click="editCurrRow(scope.row.categoryId)">{{ scope.row.orderNum }}</span>
          <el-input
            :ref="setColumnsRef"
            v-show="editIndex == scope.row.categoryId"
            v-model="scope.row.orderNum"
            @blur="handleChangeSort(scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="introduce" label="介绍" :show-overflow-tooltip="true" />
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
    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
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
          <el-col :lg="24">
            <el-form-item label="目录分类" prop="categoryType">
              <el-select v-model="form.categoryType" placeholder="请选择分类" clearable>
                <el-option v-for="dict in categoryTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="parseInt(dict.dictValue)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="目录名" prop="name">
              <el-input v-model="form.name" placeholder="请输入目录名" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="图标" prop="icon">
              <el-popover placement="bottom" :width="540" trigger="click">
                <template #reference>
                  <el-input v-model="form.icon" placeholder="点击选择图标" readonly>
                    <template #prefix>
                      <svg-icon v-if="form.icon" :name="form.icon" />
                      <el-icon v-else>
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" @selected="iconSelected" />
              </el-popover>
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" placeholder="请输入排序值" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="介绍" prop="introduce">
              <el-input v-model="form.introduce" placeholder="请输入介绍" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="背景图" prop="bgImg">
              <UploadImage ref="uploadRef" v-model="form.bgImg" :limit="1" :fileSize="15"> </UploadImage>
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
  exportArticleCategory,
  changeSort
} from '@/api/article/articlecategory.js'
import IconSelect from '@/components/IconSelect'
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
  sortType: undefined,
  categoryType: ''
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
    name: [{ required: true, message: '目录名不能为空', trigger: 'blur' }],
    categoryType: [{ required: true, message: '目录分类不能为空', trigger: 'blur' }]
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
    parentId: 0,
    icon: '',
    orderNum: 0,
    categoryType: undefined
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
  if (queryParams.categoryType) {
    form.value.categoryType = parseInt(queryParams.categoryType)
  }
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

function iconSelected(name) {
  form.value.icon = name
  document.body.click()
}

// ******************自定义编辑 start **********************
// 动态ref设置值
const columnRefs = ref([])
const setColumnsRef = (el) => {
  if (el) {
    columnRefs.value.push(el)
  }
}
const editIndex = ref(-1)
// 显示编辑排序
function editCurrRow(rowId) {
  editIndex.value = rowId

  setTimeout(() => {
    columnRefs.value[rowId].focus()
  }, 100)
}
// 保存排序
function handleChangeSort(info) {
  editIndex.value = -1
  proxy
    .$confirm('是否保存数据?')
    .then(function () {
      return changeSort({ value: info.orderNum, id: info.categoryId })
    })
    .then(() => {
      handleQuery()

      proxy.$modal.msgSuccess('修改成功')
    })
    .catch(() => {
      handleQuery()
    })
}
// ******************自定义编辑 end **********************

const categoryTypeOptions = ref([])
proxy.getDicts('article_category_type').then((response) => {
  categoryTypeOptions.value = response.data
})

handleQuery()
</script>
