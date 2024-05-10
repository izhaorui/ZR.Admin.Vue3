<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="100px" label-position="left" style="max-width: 350px">
    <el-form-item :label="$t('user.oldPwd')" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('user.newPwd')" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('user.confirmPwd')" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="danger" icon="Close" @click="close">{{ $t('btn.close') }}</el-button>
      <el-button type="primary" icon="Check" @click="submit">{{ $t('btn.save') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { updateUserPwd } from '@/api/system/user'

const { proxy } = getCurrentInstance()

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
const rules = ref({
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate((valid) => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then((response) => {
        proxy.$modal.msgSuccess('修改成功')
        close()
      })
    }
  })
}
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>
