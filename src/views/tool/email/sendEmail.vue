<template>
  <el-form class="mt10" ref="formRef" :model="form" label-width="100px" :rules="rules">
    <el-row>
      <el-col :lg="6">
        <el-form-item label="发送邮箱" prop="fromName">
          <el-select v-model="form.fromName" placeholder="请选择发送邮箱">
            <el-option
              v-for="item in sendEmailOptions"
              :key="item.fromName"
              :label="item.fromEmail ? `${item.fromName}（${item.fromEmail}）` : item.fromName"
              :value="item.fromName" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="6">
        <el-form-item label="选择模板" prop="emailTpl">
          <el-select v-model="form.emailTpl" placeholder="邮件模板" @change="handleSelectTpl" clearable>
            <el-option
              v-for="item in emailTplOptions"
              :key="item.id"
              :label="item.enabled === false ? `${item.name}（已停用）` : item.name"
              :value="item.id" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="6">
        <el-form-item label="立即发送" prop="isSend">
          <el-switch v-model="form.isSend" active-text="是" inactive-text="否"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :lg="6">
        <el-form-item label="正文格式">
          <el-radio-group v-model="form.isHtml">
            <el-radio :value="true">HTML</el-radio>
            <el-radio :value="false">纯文本</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="收件人" prop="toEmails">
      <el-tag v-for="tag in form.toEmails" :key="tag" class="mr10" closable @close="handleCloseTag(tag)">
        {{ tag }}
      </el-tag>
      <el-input
        size="small"
        v-if="inputVisible"
        style="width: 180px"
        ref="inputRef"
        v-model="inputValue"
        placeholder="请输入邮箱地址"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm" />

      <el-button v-else class="button-new-tag" size="small" icon="plus" text @click="showInput">收件人邮箱</el-button>
    </el-form-item>

    <el-row>
      <el-col :lg="12">
        <el-form-item label="抄送">
          <el-select
            v-model="form.ccEmails"
            multiple
            filterable
            allow-create
            default-first-option
            collapse-tags
            collapse-tags-tooltip
            placeholder="输入邮箱后回车，可留空"
            style="width: 100%"></el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item label="密送">
          <el-select
            v-model="form.bccEmails"
            multiple
            filterable
            allow-create
            default-first-option
            collapse-tags
            collapse-tags-tooltip
            placeholder="输入邮箱后回车，可留空"
            style="width: 100%"></el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="邮件主题" prop="subject">
      <el-input v-model="form.subject" :placeholder="'支持 {{key}} 占位符，发送前请替换为实际内容'"></el-input>
    </el-form-item>

    <el-form-item label="邮件内容" prop="htmlContent" v-if="form.isHtml">
      <editor v-model="form.htmlContent" />
    </el-form-item>
    <el-form-item label="邮件内容" prop="content" v-else>
      <el-input v-model="form.content" type="textarea" :rows="12" placeholder="请输入纯文本内容"></el-input>
    </el-form-item>

    <el-form-item label="附件">
      <UploadFile v-model="form.fileUrl" :limit="5" :fileSize="15" :data="{ fileDir: 'email', uploadType: 1 }" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="upload" @click="formSubmit">发送邮件</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup name="sendemail">
import { sendEmail, getEmailSenderOptions } from '@/api/common'

import { listEmailTpl, getEmailTpl } from '@/api/system/emailtpl.js'
import Editor from '@/components/Editor'

const router = useRouter()
const { proxy } = getCurrentInstance()
const formRef = ref(null)
const emailTplOptions = ref([])
const sendEmailOptions = ref([])

const data = reactive({
  form: {
    fileUrl: '',
    htmlContent: '',
    content: '',
    toEmails: [],
    ccEmails: [],
    bccEmails: [],
    emailTpl: undefined,
    subject: '',
    fromName: 'system',
    isSend: true,
    isHtml: true
  },
  rules: {
    fromName: [{ required: true, message: '发送邮箱不能为空', trigger: 'blur' }],
    subject: [{ required: true, message: '主题不能为空', trigger: 'blur' }],
    toEmails: [{ required: true, type: 'array', min: 1, message: '收件人不能为空', trigger: 'change' }]
  }
})

const { form, rules } = toRefs(data)

// 发件邮箱列表：由后端 MailOptions 下发，接口不可用时回退 system
getEmailSenderOptions()
  .then((res) => {
    const list = res.code === 200 && Array.isArray(res.data) ? res.data : []
    sendEmailOptions.value = list.length ? list : [{ fromName: 'system', fromEmail: '' }]
    if (!list.some((x) => x.fromName === form.value.fromName)) {
      form.value.fromName = sendEmailOptions.value[0].fromName
    }
  })
  .catch(() => {
    sendEmailOptions.value = [{ fromName: 'system', fromEmail: '' }]
  })

// 模板列表：不按启用过滤，历史模板 enabled 为 null 也要能选
listEmailTpl({ pageSize: 100 }).then((res) => {
  if (res.code !== 200 || !res.data) return
  emailTplOptions.value = res.data.result || []
})

// 选择模板：同时带出主题与正文格式，占位符保留给用户替换
function handleSelectTpl(id) {
  if (!id) return
  getEmailTpl(id).then((res) => {
    if (res.code !== 200 || !res.data) return

    const tpl = res.data
    form.value.isHtml = tpl.isHtml !== false
    if (form.value.isHtml) {
      form.value.htmlContent = tpl.content || ''
      form.value.content = ''
    } else {
      form.value.content = tpl.content || ''
      form.value.htmlContent = ''
    }
    // 主题含占位符时不自动填充，避免把 {{key}} 原样发出去；由用户按提示替换后再发
    if (tpl.subject && !tpl.subject.includes('{{')) {
      form.value.subject = tpl.subject
    }
  })
}

// 允许 user.name / user+tag 等常见地址，避免错误拦截合法邮箱
const emailReg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
function isEmail(value) {
  return emailReg.test(value)
}

/**
 * 提交
 */
function formSubmit() {
  proxy.$refs['formRef'].validate((valid) => {
    if (!valid) return

    const body = form.value.isHtml ? form.value.htmlContent : form.value.content
    if (!body || !body.trim()) {
      proxy.$modal.msgError('邮件内容不能为空')
      return
    }

    const invalid = [...form.value.toEmails, ...form.value.ccEmails, ...form.value.bccEmails].filter((x) => !isEmail(x))
    if (invalid.length) {
      proxy.$modal.msgError(`邮箱格式不正确：${invalid.join(',')}`)
      return
    }

    const payload = {
      fromName: form.value.fromName,
      subject: form.value.subject,
      toUser: form.value.toEmails.join(','),
      ccUser: form.value.ccEmails.join(','),
      bccUser: form.value.bccEmails.join(','),
      isSend: form.value.isSend !== false,
      content: form.value.isHtml ? '' : form.value.content,
      htmlContent: form.value.isHtml ? form.value.htmlContent : '',
      fileUrl: form.value.fileUrl
    }

    proxy.$modal.loading('发送中...')
    sendEmail(payload)
      .then((res) => {
        if (res.code !== 200) return

        // 后端成功/失败都是 200：data 统一为 ok / fail
        if (!payload.isSend) {
          if (res.data === 'ok') {
            proxy.$message.success('已保存为草稿')
          } else {
            proxy.$modal.msgError('保存草稿失败')
          }
        } else if (res.data === 'ok') {
          proxy.$message.success('发送成功')
        } else {
          proxy.$modal.msgError('发送失败，请到发送记录查看失败原因')
        }
        router.push({ name: 'emaillog' })
      })
      .finally(() => {
        proxy.$modal.closeLoading()
      })
  })
}

const inputVisible = ref(false)
const inputRef = ref()
const inputValue = ref('')
function handleCloseTag(tag) {
  form.value.toEmails.splice(form.value.toEmails.indexOf(tag), 1)
}

const showInput = () => {
  if (form.value.toEmails.length >= 5) {
    proxy.$modal.msgError('最多5个标签')
    return
  }
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.input.focus()
  })
}
// 标签确认
function handleInputConfirm() {
  if (inputValue.value) {
    if (!isEmail(inputValue.value)) {
      proxy.$modal.msgError('请输入有效的邮箱')
      return
    }
    if (!form.value.toEmails.includes(inputValue.value)) {
      form.value.toEmails.push(inputValue.value)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>
<style scoped>
.el-upload-list {
  width: 200px;
}
</style>
