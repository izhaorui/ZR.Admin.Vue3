<!--
 * @Descripttion: (规格模板/mms_spec_template)
 * @Author: (admin)
 * @Date: (2025-06-23)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="规格模板名称" prop="templateName">
        <el-input v-model="queryParams.templateName" placeholder="请输入规格模板名称" />
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['spectpl:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" v-hasPermi="['spectpl:delete']" plain icon="delete" @click="handleDelete">
          {{ $t('btn.delete') }}
        </el-button>
      </el-col>
    </el-row>

    <el-table
      :data="dataList"
      v-loading="loading"
      ref="table"
      border
      header-cell-class-name="el-table-header-cell"
      highlight-current-row
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="id" label="模板Id" align="center" width="100" />
      <el-table-column prop="templateName" label="规格模板名称" width="170" align="center" />
      <el-table-column prop="specJson" label="规格结构" align="center">
        <template #default="{ row }">
          {{ getSkuKey(row.specJson) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="110">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            icon="edit"
            title="编辑"
            v-hasPermi="['spectpl:edit']"
            @click="handleUpdate(scope.row)"></el-button>
          <el-button
            type="danger"
            size="small"
            icon="delete"
            title="删除"
            v-hasPermi="['spectpl:delete']"
            @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :lock-scroll="false" v-model="open">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="规格模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="请输入模板名称"></el-input>
        </el-form-item>

        <el-form-item label="规格设置">
          <div v-for="(spec, index) in state.specList" :key="index" class="spec-item">
            <div style="width: 170px">
              <el-input v-model="spec.name" placeholder="规格名 如颜色" style="width: 150px" class="mr-2" />
            </div>
            <div style="flex: 1">
              <el-tag v-for="(val, vIndex) in spec.values" :key="vIndex" closable @close="removeSpecValue(index, vIndex)" class="mr-1">
                {{ val }}
              </el-tag>

              <el-input v-model="spec.temp" @keyup.enter.native="addSpecValue(index)" placeholder="输入值后回车" style="width: 200px" />
            </div>

            <el-button type="danger" text icon="delete" @click="removeSpec(index)" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" text icon="plus" @click="addSpec">添加规格</el-button>
        </el-form-item>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" :loading="state.submitLoading" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SpecTemplate">
import { listMmsSpecTemplate, addMmsSpecTemplate, delMmsSpecTemplate, updateMmsSpecTemplate, getMmsSpecTemplate } from '@/api/shopping/spectemplate'
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
  templateName: undefined
})

const total = ref(0)
const dataList = ref([])
const queryRef = ref()

function getList() {
  loading.value = true
  listMmsSpecTemplate(queryParams)
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
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
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
    templateName: [{ required: true, message: '模板名称不能为空' }]
  },
  options: {},
  specList: []
})

const { form, rules, single, multiple } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    id: null,
    templateName: null,
    specJson: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  state.specList = []
  proxy.resetForm('formRef')
}
// 动态添加/删除规格
function addSpec() {
  if (state.specList.length >= 3) {
    ElMessage.warning('最多添加3个规格')
    return
  }
  state.specList.push({ name: '', values: [], temp: '' })
}
function removeSpec(index) {
  state.specList.splice(index, 1)
}
function addSpecValue(index) {
  const val = state.specList[index].temp.trim()
  if (val && !state.specList[index].values.includes(val)) {
    state.specList[index].values.push(val)
  }
  state.specList[index].temp = ''
}
function removeSpecValue(specIndex, valIndex) {
  state.specList[specIndex].values.splice(valIndex, 1)
}
function getSkuKey(specs) {
  return specs
    .map((s) => `${s.name}:${s.values}`)
    .sort() // 保证顺序一致
    .join('|')
}
// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  state.submitLoading = false
  title.value = '添加规格模板'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getMmsSpecTemplate(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改规格模板'
      opertype.value = 2
      state.specList = data.specJson
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
      // ✅ 规格设置校验
      if (state.specList.length === 0) {
        ElMessage.error('请至少添加一个规格')
        return
      }

      for (const [index, spec] of state.specList.entries()) {
        if (!spec.name || spec.name.trim() === '') {
          ElMessage.error(`第 ${index + 1} 个规格名称不能为空`)
          return
        }
        if (!spec.values || spec.values.length === 0) {
          ElMessage.error(`规格 "${spec.name}" 至少需要一个规格值`)
          return
        }
      }
      state.submitLoading = true
      var specJson = state.specList.map(({ name, values }) => ({ name, values }))

      if (form.value.id != undefined && opertype.value === 2) {
        updateMmsSpecTemplate({ ...form.value, specJson })
          .then((res) => {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          })
          .finally(() => {
            state.submitLoading = false
          })
      } else {
        addMmsSpecTemplate({ ...form.value, specJson })
          .then((res) => {
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
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(function () {
      return delMmsSpecTemplate(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

handleQuery()
</script>

<style scoped>
.spec-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  border: 1px solid;
  padding: 10px;
  border-radius: 5px;
  flex-wrap: wrap;
  width: 100%;
}
.mr-1 {
  margin-right: 4px;
}
.mr-2 {
  margin-right: 8px;
}
</style>
