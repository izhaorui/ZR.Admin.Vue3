<!--
 * @Descripttion: (多语言配置/)
 * @version: (1.0)
 * @Author: (zr)
 * @Date: (2022-05-06)
 * @LastEditors: (最后更新作者)
 * @LastEditTime: (最后更新时间)
-->
<template>
  <div class="app-container">
    <!-- :model属性用于表单验证使用 比如下面的el-form-item 的 prop属性用于对表单值进行验证操作 -->
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="语言code" prop="langCode">
        <el-select v-model="queryParams.langCode" placeholder="请选择语言code">
          <el-option v-for="item in sys_lang_type" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="语言key" prop="langKey">
        <el-input v-model="queryParams.langKey" placeholder="请输入语言key" />
      </el-form-item>
      <el-form-item label="显示方式">
        <el-radio-group v-model="queryParams.showMode">
          <el-radio-button label="1">表格</el-radio-button>
          <el-radio-button label="2">行列</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="添加时间">
        <el-date-picker
          v-model="dateRangeAddtime"
          style="width: 240px"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          placeholder="请选择添加时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          :shortcuts="dateOptions"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['system:lang:add']" plain icon="plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" :disabled="single" v-hasPermi="['system:lang:edit']" plain icon="edit" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" v-hasPermi="['system:lang:delete']" plain icon="delete" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['system:lang:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据区域 -->
    <el-table
      v-if="queryParams.showMode == 1"
      :data="dataList"
      v-loading="loading"
      ref="table"
      border
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />

      <!-- <el-table-column prop="id" label="id" align="center" /> -->
      <el-table-column prop="langCode" label="语言code" align="center">
        <template #default="scope">
          <dict-tag :options="sys_lang_type" :value="scope.row.langCode" />
        </template>
      </el-table-column>
      <el-table-column prop="langKey" label="语言key" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="langName" label="名称" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="addtime" label="添加时间" align="center" :show-overflow-tooltip="true" />

      <el-table-column label="操作" align="center" width="140">
        <template #default="scope">
          <el-button v-hasPermi="['system:lang:edit']" type="success" icon="edit" title="编辑" @click="handleUpdate(scope.row)"></el-button>
          <el-button v-hasPermi="['system:lang:delete']" type="danger" icon="delete" title="删除" @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 行列显示 -->
    <el-table
      v-if="queryParams.showMode == 2"
      :data="dataList"
      v-loading="loading"
      ref="table"
      border
      highlight-current-row
      @sort-change="sortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column prop="langKey" label="语言key" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="zh-cn" label="中文" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="en" label="英文" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="zh-tw" label="繁体" align="center" :show-overflow-tooltip="true" />
      <!-- <el-table-column label="操作" align="center" width="140">
        <template #default="scope">
          <el-button v-hasPermi="['system:lang:edit']" type="success" icon="edit" title="编辑" @click="handleUpdate(scope.row)"></el-button>
          <el-button v-hasPermi="['system:lang:delete']" type="danger" icon="delete" title="删除" @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-if="total > 0" class="mt10" background :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改多语言配置对话框 -->
    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <!-- <el-col :lg="24">
            <el-form-item label="语言code" prop="langCode">
              <el-select v-model="form.langCode" placeholder="请选择语言code">
                <el-option v-for="item in sys_lang_type" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->

          <el-col :lg="24">
            <el-form-item label="语言key" prop="langKey">
              <template #label>
                <el-tooltip content="翻译key，eg：message.title" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                翻译key
              </template>
              <el-input v-model="form.langKey" placeholder="请输入语言key" />
            </el-form-item>
          </el-col>
          <!-- <el-col :lg="24">
            <el-form-item :label="item.langCode" prop="langName" v-for="(item, index) in form.langs" :key="index">
              <el-input type="textarea" v-model="item.langName" placeholder="请输入名称" />
            </el-form-item>
          </el-col> -->

          <el-col :lg="24">
            <el-form-item label="中文内容" prop="langName">
              <el-input type="textarea" v-model="form.langName" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="英文内容" prop="langNameEn">
              <el-input type="textarea" v-model="form.langNameEn" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="繁体内容" prop="langNameTw">
              <el-input type="textarea" v-model="form.langNameTw" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="text" @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="commonlang">
import { listCommonLang, addCommonLang, delCommonLang, updateCommonLang, getCommonLang, exportCommonLang } from '@/api/system/commonlang.js'

const { proxy } = getCurrentInstance()
// 选中id数组数组
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
  langCode: undefined,
  langKey: undefined,
  addtime: undefined,
  showMode: 1, // 显示模式 1、table显示 2、行列显示
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
    id: [{ required: true, message: 'id不能为空', trigger: 'blur', type: 'number' }],
    // langCode: [{ required: true, message: '语言code不能为空', trigger: 'change' }],
    langKey: [{ required: true, message: '语言key不能为空', trigger: 'change' }],
    langName: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
    langNameEn: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
    langNameTw: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
  },
})

const { form, rules } = toRefs(state)
// 总记录数
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const formRef = ref()
// 语言code选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
const sys_lang_type = ref([])
// 添加时间时间范围
const dateRangeAddtime = ref([])

var dictParams = [{ dictType: 'sys_lang_type' }]

proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    proxy[element.dictType] = element.list
  })
})
watch(
  () => queryParams.showMode,
  () => {
    getList()
  },
  { immediate: true },
)
function getList() {
  proxy.addDateRange(queryParams, proxy.dateRangeAddtime, 'Addtime')
  loading.value = true
  listCommonLang(queryParams).then((res) => {
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
      return delCommonLang(Ids)
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
  getCommonLang(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改数据'
      opertype.value = 2

      form.value = {
        ...data,
      }
    }
  })
}

// 表单提交
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined && opertype.value === 2) {
        updateCommonLang(form.value)
          .then((res) => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          })
          .catch(() => {})
      } else {
        addCommonLang(form.value)
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
  dateRangeAddtime.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}
// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出所有多语言配置数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(function () {
      return exportCommonLang(queryParams)
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
