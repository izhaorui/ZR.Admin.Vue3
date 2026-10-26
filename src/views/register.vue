<template>
  <div class="login-container">
    <brandPanel />

    <!-- 右侧注册表单区 -->
    <div class="form-panel">
      <div class="login-card">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-subtitle">创建您的账号，开启高效管理</p>

        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form">
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" type="text" size="default" auto-complete="off" placeholder="账号">
              <template #prefix>
                <svg-icon name="user" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              size="default"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleRegister">
              <template #prefix>
                <svg-icon name="password" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="default"
              auto-complete="off"
              placeholder="确认密码"
              @keyup.enter="handleRegister">
              <template #prefix>
                <svg-icon name="password" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaOnOff">
            <el-input
              v-model="registerForm.code"
              auto-complete="off"
              size="default"
              placeholder="验证码"
              style="width: 63%"
              @keyup.enter="handleRegister">
              <template #prefix>
                <svg-icon name="validCode" class="input-icon" />
              </template>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" @click="getCode" class="login-code-img" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" type="primary" size="default" round class="login-btn" @click.prevent="handleRegister">
              <span v-if="!loading">{{ $t('login.register') }}</span>
              <span v-else>注 册 中...</span>
            </el-button>
          </el-form-item>
          <div class="link-wrap">
            <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
          </div>
        </el-form>
        <oauthLogin></oauthLogin>
      </div>
    </div>
  </div>

  <div class="el-login-footer">
    <div v-html="copyRight"></div>
  </div>
</template>

<script setup name="register">
import { getCodeImg, register } from '@/api/system/login'
import defaultSettings from '@/settings'
import { ElMessageBox } from 'element-plus'
import oauthLogin from './components/Login/oauthLogin.vue'
import brandPanel from './components/Login/brandPanel.vue'
const { proxy } = getCurrentInstance()
const router = useRouter()
const codeUrl = ref('')
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: ''
})

const registerFormRef = ref(null)
const loading = ref(false)
const captchaOnOff = ref(true)
const equalToPassword = (rule, value, callback) => {
  if (registerForm.password !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
const registerRules = reactive({
  username: [
    { required: true, trigger: 'blur', message: '请输入您的账号' },
    {
      min: 5,
      max: 20,
      message: '用户账号长度必须介于 5 和 20 之间',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入您的密码' },
    {
      // 与后端密码策略（sys.account.pwd.*，默认 8-32 位）保持一致
      min: 8,
      max: 32,
      message: '密码长度必须介于 8 和 32 之间，且需包含数字和字母',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '请再次输入您的密码' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
})
const copyRight = computed(() => {
  return defaultSettings.copyright
})
const title = computed(() => {
  return defaultSettings.title
})

function getCode() {
  getCodeImg().then((res) => {
    codeUrl.value = res.data.img
    registerForm.uuid = res.data.uuid
    // this.$forceUpdate()
  })
}
function handleRegister() {
  proxy.$refs['registerFormRef'].validate((valid) => {
    if (valid) {
      loading.value = true
      register(registerForm)
        .then((res) => {
          if (res.code == 200) {
            const username = registerForm.username
            ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + ' 注册成功！</font>', '系统提示', {
              dangerouslyUseHTMLString: true,
              type: 'success'
            })
              .then(() => {
                router.push('/login')
              })
              .catch(() => {})
          }
        })
        .catch(() => {
          loading.value = false
          if (captchaOnOff.value) {
            getCode()
          }
        })
    }
  })
}
getCode()
</script>

<style rel="stylesheet/scss" scoped lang="scss">
@use '@/assets/styles/login.scss';

.link-wrap {
  margin-top: -6px;
  text-align: center;
  font-size: 13px;
}
</style>
