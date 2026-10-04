<template>
  <el-dialog :title="title" :lock-scroll="false" append-to-body v-model="open" width="500">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :lg="24">
          <el-form-item label="分组名称" prop="groupName">
            <el-input v-model="form.groupName" placeholder="请输入名称" />
          </el-form-item>
        </el-col>

        <el-col :lg="24">
          <el-form-item label="上级分组" prop="parentId">
            <el-cascader
              class="w100"
              :options="dataList"
              :props="{ checkStrictly: true, value: 'groupId', label: 'groupName', emitPath: false }"
              placeholder="请选择上级菜单"
              clearable
              v-model="form.parentId">
              <template #default="{ node, data }">
                <span>{{ data.groupName }}</span>
                <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>

        <el-col :lg="24">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" placeholder="请输入排序" />
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
</template>

<script setup>
import { treelistFileGroup, addFileGroup, updateFileGroup } from '@/api/tool/filegroup.js'

const { proxy } = getCurrentInstance()
const loading = ref(false)
const dataList = ref([])
const emit = defineEmits(['success'])

function getList() {
  loading.value = true
  treelistFileGroup()
    .then((res) => {
      const { code, data } = res
      if (code == 200) {
        dataList.value = res.data
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 验证目录名的正则表达式
const validateDirname = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('目录名不能为空'))
  }

  // 常见目录名正则规则
  const regex = /^[a-zA-Z0-9_\-\u4e00-\u9fa5][a-zA-Z0-9_\-\s\u4e00-\u9fa5]*$/

  // Windows系统目录名额外限制
  const windowsReserved = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9'
  ]

  if (value.length > 255) {
    return callback(new Error('目录名长度不能超过255个字符'))
  }

  if (/[\\/:*?"<>|]/.test(value)) {
    return callback(new Error('目录名不能包含 \\ / : * ? " < > | 等字符'))
  }
  if (/\s/.test(value)) {
    return callback(new Error('目录名不允许包含空格'))
  }
  if (value.endsWith('.') || value.endsWith(' ')) {
    return callback(new Error('目录名不能以点或空格结尾'))
  }

  if (windowsReserved.includes(value.toUpperCase())) {
    return callback(new Error('不能使用系统保留名称作为目录名'))
  }

  if (!regex.test(value)) {
    return callback(new Error('目录名只能包含字母、数字、下划线、短横线、中文和空格'))
  }

  callback()
}

/*************** form操作 ***************/
const formRef = ref()
const title = ref('')
// 操作类型 1、add 2、edit
const opertype = ref(0)
const open = ref(false)
const state = reactive({
  form: {},
  rules: {
    groupName: [{ required: true, validator: validateDirname, trigger: 'blur' }],
    sort: [{ required: true, message: '排序不能为空', trigger: 'blur', type: 'number' }]
  }
})

const { form, rules } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    sort: 100
  }
  proxy.resetForm('formRef')
}
// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加'
  opertype.value = 1
  getList()
}

// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.groupId || ids.value
  open.value = true
  title.value = '修改数据'
  opertype.value = 2
  getList()
  form.value = {
    ...row
  }
}
// 添加&修改 表单提交
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.groupId != undefined && opertype.value === 2) {
        updateFileGroup(form.value).then((res) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
          emit('success')
        })
      } else {
        addFileGroup(form.value).then((res) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
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
</script>
