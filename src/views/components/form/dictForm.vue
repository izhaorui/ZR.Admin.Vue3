<template>
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
          <el-radio-button v-for="dict in typeOptions" :key="dict.dictValue" :value="dict.dictValue">{{ dict.dictLabel }}</el-radio-button>
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
</template>
<script setup>
import { getType, addType, updateType } from '@/api/system/dict/type'
const open = ref(false)
const { proxy } = getCurrentInstance()
const state = reactive({
  rules: {
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
  },
  form: {}
})
const { rules, form } = toRefs(state)
// 弹出层标题
const title = ref('')
const emit = defineEmits(['success'])
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

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加字典类型'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const dictId = row.dictId
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
          //   getList()
          emit('success')
        })
      } else {
        addType(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          //   getList()
          emit('success')
        })
      }
    }
  })
}
defineExpose({
  handleAdd,
  handleUpdate
})
const statusOptions = ref([])
const typeOptions = ref([])
proxy.getDicts('sys_normal_disable').then((response) => {
  statusOptions.value = response.data
})
proxy.getDicts('sys_yes_no').then((response) => {
  typeOptions.value = response.data
})
</script>
