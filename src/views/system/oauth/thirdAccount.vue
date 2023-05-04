<!--
 * @Descripttion: (三方账号绑定/third_account)
 * @version: (1.0)
 * @Author: (zz)
 * @Date: (2022-06-23)
 * @LastEditors: (zz)
 * @LastEditTime: (2022-06-23)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="用户id" prop="userId">
        <el-input v-model.number="queryParams.userId" placeholder="请输入用户id" />
      </el-form-item>
      <el-form-item label="三方唯一id" prop="thirdUniqueAcount">
        <el-input v-model="queryParams.thirdUniqueAcount" placeholder="请输入三方唯一id" />
      </el-form-item>
      <!-- <el-form-item label="账号类型" prop="accountType">
        <el-select v-model="queryParams.accountType" placeholder="请选择账号类型">
          <el-option v-for="item in options.accountTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="添加时间">
        <el-date-picker
          v-model="dateRangeAddTime"
          style="width: 240px"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          placeholder="请选择添加时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          :shortcuts="dateOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['system:thirdaccount:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :disabled="single" v-hasPermi="['system:thirdaccount:edit']" plain icon="edit" @click="handleUpdate">
          {{ $t('btn.edit') }}
        </el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" v-hasPermi="['system:thirdaccount:delete']" plain icon="delete" @click="handleDelete">
          {{ $t('btn.delete') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['system:thirdaccount:export']">
          {{ $t('btn.export') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据区域 -->
    <el-table
      :data="dataList"
      v-loading="loading"
      ref="table"
      border
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />

      <el-table-column prop="id" label="id" align="center" sortable />
      <el-table-column prop="userId" label="用户id" align="center" />
      <el-table-column prop="user.nickName" label="昵称" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="thirdUniqueAcount" label="三方唯一id" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="accountType" label="账号类型" align="center"> </el-table-column>
      <el-table-column prop="addTime" label="添加时间" align="center" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="160">
        <template #default="scope">
          <!-- <el-button v-hasPermi="['system:thirdaccount:edit']" type="success" icon="edit" title="编辑" @click="handleUpdate(scope.row)"></el-button> -->
          <el-button
            v-hasPermi="['system:thirdaccount:delete']"
            type="danger"
            icon="delete"
            title="删除"
            @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      class="mt10"
      background
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改三方账号绑定对话框 -->
    <el-dialog :title="title" :lock-scroll="false" v-model="open">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :lg="24">
            <el-form-item label="id" prop="id">
              <el-input-number v-model.number="form.id" controls-position="right" placeholder="请输入id" :disabled="title == '修改数据'" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="用户id" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户id" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="三方唯一id" prop="thirdUniqueAcount">
              <el-input v-model="form.thirdUniqueAcount" placeholder="请输入三方唯一id" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="账号类型" prop="accountType">
              <el-select v-model="form.accountType" placeholder="请选择账号类型">
                <el-option
                  v-for="item in options.accountTypeOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="添加时间" prop="addTime">
              <el-date-picker v-model="form.addTime" type="datetime" :teleported="false" placeholder="选择日期时间"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="thirdaccount">
import {
  listThirdAccount,
  addThirdAccount,
  delThirdAccount,
  updateThirdAccount,
  getThirdAccount,
  exportThirdAccount
} from '@/api/system/thirdaccount.js'

const { proxy } = getCurrentInstance()
// 选中id数组数组
const ids = ref([])
// 非单选禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'id',
  sortType: 'desc',
  userId: undefined,
  thirdUniqueAcount: undefined,
  accountType: undefined,
  addTime: undefined
})

const title = ref('')
// 操作类型 1、add 2、edit 3、view
const opertype = ref(0)
const open = ref(false)
const state = reactive({
  form: {},
  rules: {
    id: [{ required: true, message: 'id不能为空', trigger: 'blur', type: 'number' }],
    userId: [{ required: true, message: '用户id不能为空', trigger: 'blur', type: 'number' }],
    thirdUniqueAcount: [{ required: true, message: '三方唯一id不能为空', trigger: 'blur' }],
    accountType: [{ required: true, message: '账号类型不能为空', trigger: 'change' }]
  },
  options: {
    //  账号类型 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    accountTypeOptions: []
  }
})

const { form, rules, options } = toRefs(state)
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const formRef = ref()
// 添加时间时间范围
const dateRangeAddTime = ref([])

var dictParams = []

function getList() {
  proxy.addDateRange(queryParams, dateRangeAddTime.value, 'AddTime')
  loading.value = true
  listThirdAccount(queryParams).then((res) => {
    if (res.code == 200) {
      dataList.value = res.data.result
      total.value = res.data.totalNum
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
    id: undefined,
    userId: undefined,
    thirdUniqueAcount: undefined,
    accountType: undefined,
    addTime: undefined
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
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？')
    .then(function () {
      return delThirdAccount(Ids)
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
  const id = row.id || ids.value
  getThirdAccount(id).then((res) => {
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
      if (form.value.id != undefined && opertype.value === 2) {
        updateThirdAccount(form.value)
          .then((res) => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          })
          .catch(() => {})
      } else {
        addThirdAccount(form.value)
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
  // 添加时间时间范围
  dateRangeAddTime.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}
// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出所有三方账号绑定数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return exportThirdAccount(queryParams)
    })
    .then((response) => {
      proxy.download(response.data.path)
    })
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
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
