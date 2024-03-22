<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="queryParams.dictType" placeholder="请输入字典类型" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="字典状态" clearable>
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否内置" prop="type">
        <el-select v-model="queryParams.type" placeholder="是否内置" clearable>
          <el-option v-for="dict in typeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="plus" @click="handleAdd" v-hasPermi="['system:dict:add']"> {{ $t('btn.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:dict:edit']">
          {{ $t('btn.edit') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:dict:remove']">
          {{ $t('btn.delete') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['system:dict:export']">
          {{ $t('btn.export') }}
        </el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="typeList" v-loading="loading" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编号" align="center" prop="dictId" width="100" sortable />
      <el-table-column label="字典类型" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-link type="primary" @click="showDictData(scope.row)">{{ scope.row.dictType }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="字典名称" align="center" prop="dictName" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="statusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button text size="small" icon="edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']">
            {{ $t('btn.edit') }}
          </el-button>
          <el-button text size="small" icon="delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']">
            {{ $t('btn.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" v-model="open" draggable width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <template #label>
            <span>
              <el-tooltip content="如果从数据库加载数据，请使用sql_开头字符串" placement="top">
                <el-icon :size="15">
                  <questionFilled />
                </el-icon>
              </el-tooltip>
              字典类型
            </span>
          </template>
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="字典状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :value="dict.dictValue">{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="系统内置" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="dict in typeOptions" :key="dict.dictValue" :value="dict.dictValue">{{ dict.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="自定义sql" prop="customSql">
          <template #label>
            <span>
              <el-tooltip
                content="如果从数据库加载数据，请按此格式配置sql语句：SELECT userId as dictValue, userName as dictLabel FROM sys_user"
                placement="top">
                <el-icon :size="15">
                  <questionFilled />
                </el-icon>
              </el-tooltip>
              sql语句
            </span>
          </template>
          <el-input v-model="form.customSql" type="textarea" placeholder="请输入sql语句"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dictDataVisible" draggable width="60%" :lock-scroll="false">
      <dict-data v-model:dictId="dictId"></dict-data>
    </el-dialog>
  </div>
</template>

<script setup name="dict">
import dictData from '@/views/components/dictData'
import { listType, getType, delType, addType, updateType, exportType } from '@/api/system/dict/type'

const { proxy } = getCurrentInstance()
// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 字典表格数据
const typeList = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 字典弹出层
const dictDataVisible = ref(false)
// 状态数据字典
const statusOptions = ref([])
// 是否内置
const typeOptions = ref([])
// 日期范围
const dateRange = ref([])
// 查询参数

const formRef = ref()
// 字典Id传值给子组件
const dictId = ref(0)

const state = reactive({
  rules: {
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
  },
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined
  }
})
const { rules, form, queryParams } = toRefs(state)

/** 查询字典类型列表 */
function getList() {
  loading.value = true
  listType(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    typeList.value = response.data.result
    total.value = response.data.totalNum
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}
// 表单重置
function reset() {
  form.value = {
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: '0',
    type: 'N',
    remark: undefined
  }
  proxy.resetForm('formRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryForm')
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加字典类型'
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.dictId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const dictId = row.dictId || ids.value
  getType(dictId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改字典类型'
  })
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.dictId != undefined) {
        updateType(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addType(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const dictIds = row.dictId || ids.value
  proxy
    .$confirm('是否确认删除字典编号为"' + dictIds + '"的数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return delType(dictIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
/** 导出按钮操作 */
function handleExport() {
  proxy
    .$confirm('是否确认导出所有类型数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return exportType(queryParams.value)
    })
    .then((response) => {
      proxy.download(response.data.path)
    })
}
function showDictData(row) {
  dictId.value = row.dictId
  dictDataVisible.value = true
}

getList()
proxy.getDicts('sys_normal_disable').then((response) => {
  statusOptions.value = response.data
})
proxy.getDicts('sys_yes_no').then((response) => {
  typeOptions.value = response.data
})
</script>
