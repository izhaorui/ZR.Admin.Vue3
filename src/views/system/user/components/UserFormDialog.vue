<template>
  <el-dialog v-model="visible" :title="title" width="600px" append-to-body>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-row :gutter="20">
        <el-col :lg="12">
          <el-form-item label="用户名" prop="userName">
            <el-input :disabled="formData.userId != undefined" v-model="formData.userName" placeholder="请输入用户名(用于登陆)" />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.userId == undefined" :lg="12">
          <el-form-item label="用户密码" prop="password">
            <el-input v-model="formData.password" show-password placeholder="请输入用户密码" type="password" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="formData.nickName" placeholder="请输入用户昵称" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="归属部门" prop="deptId">
            <el-tree-select
              v-model="formData.deptId"
              :data="deptOptions"
              :props="{ value: 'id', label: 'label', children: 'children' }"
              value-key="id"
              placeholder="请选择归属部门"
              check-strictly
              :render-after-expand="false"
              clearable />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input v-model="formData.phonenumber" placeholder="请输入手机号码" maxlength="11" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="用户性别">
            <el-radio-group v-model="formData.sex" placeholder="请选择用户性别">
              <el-radio-button v-for="dict in sexOptions" :key="dict.dictValue" :value="parseInt(dict.dictValue)">
                {{ dict.dictLabel }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="用户状态">
            <el-radio-group v-model="formData.status">
              <el-radio-button v-for="dict in statusOptions" :key="dict.dictValue" :value="parseInt(dict.dictValue)">
                {{ dict.dictLabel }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="岗位">
            <el-select v-model="formData.postIds" multiple placeholder="请选择岗位" style="width: 100%">
              <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId" :disabled="item.status == 1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="角色">
            <el-select v-model="formData.roleIds" multiple placeholder="请选择角色" style="width: 100%" @change="emit('select-role', $event)">
              <el-option
                v-for="item in roleOptions"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
                :disabled="item.status == 1 || formData.userId == 1">
                <span style="float: left">{{ item.roleName }}</span>
                <span style="float: right">{{ item.roleKey }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="备注">
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button text @click="emit('cancel')">{{ $t('btn.cancel') }}</el-button>
      <el-button type="primary" @click="emit('submit')">{{ $t('btn.submit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: ''
  },
  form: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    required: true
  },
  deptOptions: {
    type: Array,
    default: () => []
  },
  sexOptions: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  postOptions: {
    type: Array,
    default: () => []
  },
  roleOptions: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['cancel', 'select-role', 'submit', 'update:modelValue'])
const formRef = ref()
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const formData = computed(() => props.form)

function resetFields() {
  formRef.value?.resetFields()
}

function validate(callback) {
  return formRef.value?.validate(callback)
}

defineExpose({ resetFields, validate })
</script>
