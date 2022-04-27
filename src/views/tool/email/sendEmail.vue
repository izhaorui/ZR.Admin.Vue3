<template>
  <el-form class="mt10" ref="formRef" :model="form" label-width="110px" :rules="rules">
    <el-form-item
      v-for="(domain, index) in form.toEmails"
      :prop="'toEmails.' + index + '.value'"
      :label="'收件邮箱' + (index === 0 ? '' : index)"
      :key="domain.key"
      :rules="[
        { required: true, message: '邮箱不能为空', trigger: 'blur' },
        { message: '请输入正确的邮箱地址', trigger: ['blur', 'change'], type: 'email' },
      ]"
    >
      <el-input v-model="domain.value" style="width: 300px"></el-input>
      <el-button class="ml10" @click="addDomain" icon="plus" />
      <el-button class="ml10" @click.prevent="removeDomain(domain)" icon="minus" />
    </el-form-item>
    <el-form-item label="邮件主题" prop="subject">
      <el-input v-model="form.subject"></el-input>
    </el-form-item>
    <el-form-item label="邮件内容" prop="htmlContent">
      <editor v-model="form.htmlContent" />
    </el-form-item>
    <el-form-item label="发送自己" prop="sendMe">
      <el-switch v-model="form.sendMe" active-text="是" inactive-text="否"></el-switch>
    </el-form-item>
    <el-form-item label="附件">
      <UploadFile v-model="form.fileUrl" :limit="5" :fileSize="15" :data="{ fileDir: 'email', uploadType: 1 }" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="formSubmit">发送邮件</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup name="sendEmail">
import { sendEmail } from '@/api/common'
import Editor from '@/components/Editor'

const data = reactive({
  form: {
    fileUrl: '',
    htmlContent: '',
    toEmails: [
      {
        value: '',
      },
    ],
  },
  rules: {
    subject: [{ required: true, message: '主题不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
  },
})

const { form, rules } = toRefs(data)
const { proxy } = getCurrentInstance()
const formRef = ref(null)
const open = ref(false)
// 表单重置
function reset() {
  form.value = {
    toUser: undefined,
    htmlContent: undefined,
    subject: undefined,
    fileUrl: undefined,
    sendMe: false,
    toEmails: [
      {
        value: '',
      },
    ],
  }
  proxy.resetForm('formRef')
}

/**
 * 提交
 */
function formSubmit() {
  proxy.$refs['formRef'].validate((valid) => {
    //开启校验
    if (valid) {
      proxy.$modal.loading('loading...')
      var emails = []
      form.value.toEmails.filter((x) => {
        emails.push(x.value)
      })
      var p = {
        ...form.value,
        toUser: emails.toString(),
      }
      // 如果校验通过，请求接口，允许提交表单
      sendEmail(p).then((res) => {
        open.value = false
        if (res.code == 200) {
          proxy.$message.success('发送成功')
          reset()
        }
        proxy.$modal.closeLoading()
      })
      setTimeout(() => {
        proxy.$modal.closeLoading()
      }, 5000)
    } else {
      console.log('未通过')
      //校验不通过
      return false
    }
  })
}

function removeDomain(item) {
  var index = form.value.toEmails.indexOf(item)
  if (index !== -1 && form.value.toEmails.length !== 1) {
    form.value.toEmails.splice(index, 1)
  } else {
    proxy.$message({
      message: '请至少保留一位联系人',
      type: 'warning',
    })
  }
}

function addDomain() {
  form.value.toEmails.push({
    value: '',
    key: Date.now(),
  })
}
</script>
<style scoped>
.el-upload-list {
  width: 200px;
}
</style>
