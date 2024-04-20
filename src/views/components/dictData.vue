<template>
  <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
    <el-form-item label="字典名称" prop="dictType">
      <el-select v-model="queryParams.dictType">
        <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-select v-model="queryParams.status" placeholder="数据状态" clearable>
        <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
      <el-button icon="refresh" @click="resetQuery">重置</el-button>
    </el-form-item>
  </el-form>

  <el-row :gutter="10" class="mb8">
    <el-col :span="1.5">
      <el-button type="primary" plain icon="plus" @click="handleAdd" v-hasPermi="['system:dict:add']">新增数据</el-button>
    </el-col>
  </el-row>
  <el-table :data="dataList">
    <!-- <el-table-column type="selection" width="55" align="center" /> -->
    <el-table-column label="字典编码" align="center" prop="dictCode" />
    <el-table-column label="字典标签" align="center" prop="dictLabel">
      <template #default="scope">
        <span v-if="scope.row.listClass == '' || scope.row.listClass == 'default'" :class="scope.row.cssClass">{{ scope.row.dictLabel }}</span>
        <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass" :class="scope.row.cssClass"
          >{{ scope.row.dictLabel }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="翻译键值" align="center" prop="langKey" />
    <el-table-column label="字典键值" align="center" prop="dictValue" sortable />
    <el-table-column label="字典排序" align="center" prop="dictSort" sortable />
    <el-table-column label="状态" align="center" prop="status">
      <template #default="scope">
        <dict-tag :options="statusOptions" :value="scope.row.status" />
      </template>
    </el-table-column>
    <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
    <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="130px">
      <template #default="scope">
        <div v-if="scope.row.dictCode > 0">
          <el-button text size="default" icon="edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dict:edit']"></el-button>
          <el-button text size="default" icon="delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dict:remove']"> </el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <pagination :total="total" v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

  <!-- 添加或修改参数配置对话框 -->
  <el-dialog :title="title" v-model="open" draggable width="500px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-row :gutter="20">
        <el-col :lg="24">
          <el-form-item label="字典类型">
            <el-input v-model="form.dictType" :disabled="true" />
          </el-form-item>
        </el-col>

        <el-col :lg="12">
          <el-form-item label="字典标签" prop="dictLabel">
            <el-input v-model="form.dictLabel" placeholder="请输入字典标签" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="翻译键值" prop="langKey">
            <el-input v-model="form.langKey" placeholder="请输入翻译键值" />
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="数据键值" prop="dictValue">
            <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="样式属性" prop="cssClass">
            <el-select v-model="form.cssClass" allow-create filterable clearable="">
              <el-option v-for="dict in cssClassOptions" :class="dict.value" :key="dict.value" :label="dict.label" :value="dict.value">
                <span style="float: left" :class="dict.value">{{ dict.label }}</span>
                <span style="float: right">{{ dict.value }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="回显样式" prop="listClass">
            <el-select v-model="form.listClass">
              <el-option v-for="item in listClassOptions" :key="item.value" :label="item.label + '(' + item.value + ')'" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="显示排序" prop="dictSort">
            <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :lg="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button text @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup name="dictData">
import { listData, getData, delData, addData, updateData } from '@/api/system/dict/data'
import { listType, getType } from '@/api/system/dict/type'
const { proxy } = getCurrentInstance()
const props = defineProps({
  dictId: {
    type: Number,
    default: 0
  }
})
watch(
  () => props.dictId,
  (newVal, oldValue) => {
    if (newVal) {
      getTypeInfo(newVal)
      getTypeList()
      proxy.getDicts('sys_normal_disable').then((response) => {
        statusOptions.value = response.data
      })
    }
  },
  {
    immediate: true,
    deep: true
  }
)

const ids = ref()
const loading = ref(false)
// 总条数
const total = ref(0)
// 字典表格数据
const dataList = ref([])
// 默认字典类型
const defaultDictType = ref('')
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 数据标签回显样式
const listClassOptions = ref([
  {
    value: 'default',
    label: '默认'
  },
  {
    value: 'primary',
    label: '主要'
  },
  {
    value: 'success',
    label: '成功'
  },
  {
    value: 'info',
    label: '信息'
  },
  {
    value: 'warning',
    label: '警告'
  },
  {
    value: 'danger',
    label: '危险'
  }
])

const cssClassOptions = ref([
  {
    value: 'text-primary',
    label: '主要'
  },
  {
    value: 'text-success',
    label: '成功'
  },
  {
    value: 'text-info',
    label: '信息'
  },
  {
    value: 'text-warning',
    label: '警告'
  },
  {
    value: 'text-danger',
    label: '危险'
  },
  {
    value: 'text-orange',
    label: '橘红色'
  },
  {
    value: 'text-hotpink',
    label: '粉红色'
  },
  {
    value: 'text-green',
    label: '绿色'
  },
  {
    value: 'text-greenyellow',
    label: '黄绿色'
  },
  {
    value: 'text-purple',
    label: '紫色'
  }
])
// 状态数据字典
const statusOptions = ref([])
// 类型数据字典
const typeOptions = ref([])
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dictName: undefined,
  dictType: undefined,
  status: undefined
})
// 表单参数

const formRef = ref()
const state = reactive({
  form: {},
  rules: {
    dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
    dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
    dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
    langKey: [{ pattern: /^[A-Za-z].+$/, message: '输入格式不正确,格式：login.ok', trigger: 'blur' }]
  }
})

const { form, rules } = toRefs(state)
/** 查询字典类型详细 */
function getTypeInfo(dictId) {
  getType(dictId).then((response) => {
    queryParams.dictType = response.data.dictType
    defaultDictType.value = response.data.dictType
    getList()
  })
}
/** 查询字典类型列表 */
function getTypeList() {
  listType().then((response) => {
    typeOptions.value = response.data.result
  })
}

/** 查询字典数据列表 */
function getList() {
  loading.value = true
  listData(queryParams).then((response) => {
    dataList.value = response.data.result
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
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    dictSort: 0,
    status: '0',
    remark: undefined
  }
  proxy.resetForm('formRef')
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryForm')
  queryParams.dictType = defaultDictType.value
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加字典数据'
  form.value.dictType = queryParams.dictType
}
// 多选框选中数据
// function handleSelectionChange(selection) {
//   this.ids = selection.map((item) => item.dictCode)
//   this.single = selection.length != 1
//   this.multiple = !selection.length
// }
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const dictCode = row.dictCode || ids.value
  getData(dictCode).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改字典数据'
  })
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.dictCode != undefined) {
        updateData(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addData(form.value).then((response) => {
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
  const dictCodes = row.dictCode || ids.value
  proxy
    .$confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return delData(dictCodes)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}
</script>
