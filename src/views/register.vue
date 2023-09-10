<template>
  <starBackground></starBackground>
  <div class="login-wrap">
    <div class="login">
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="login-form">
        <h3 class="title">{{ title }}</h3>
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" type="text" auto-complete="off" placeholder="账号">
            <template #prefix>
              <svg-icon name="user" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" auto-complete="off" placeholder="密码" @keyup.enter="handleRegister">
            <template #prefix>
              <svg-icon name="password" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" auto-complete="off" placeholder="确认密码" @keyup.enter="handleRegister">
            <template #prefix>
              <svg-icon name="password" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaOnOff">
          <el-input v-model="registerForm.code" auto-complete="off" placeholder="验证码" style="width: 63%" @keyup.enter="handleRegister">
            <template #prefix>
              <svg-icon name="validCode" />
            </template>
          </el-input>
          <div class="register-code ml10">
            <img :src="codeUrl" @click="getCode" class="register-code-img" />
          </div>
        </el-form-item>
        <el-form-item style="width: 100%">
          <el-button :loading="loading" type="primary" size="default" round style="width: 100%" @click.prevent="handleRegister">
            <span v-if="!loading">{{ $t('login.register') }}</span>
            <span v-else>注 册 中...</span>
          </el-button>
        </el-form-item>
        <div style="text-align: center">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form>
      <oauthLogin></oauthLogin>
    </div>
    <!--  底部  -->
    <div class="el-register-footer">
      <div v-html="copyRight"></div>
    </div>
  </div>
</template>

<script setup name="register">
import starBackground from '@/views/components/starBackground.vue'
import { getCodeImg, register } from '@/api/system/login'
import defaultSettings from '@/settings'
import { ElMessageBox } from 'element-plus'
import oauthLogin from './components/Login/oauthLogin.vue'
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
      min: 2,
      max: 20,
      message: '用户账号长度必须介于 2 和 20 之间',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入您的密码' },
    {
      min: 5,
      max: 20,
      message: '用户密码长度必须介于 6 和 20 之间',
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
    codeUrl.value = 'data:image/gif;base64,' + res.data.img
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

<style rel="stylesheet/scss" lang="scss">
@import '@/assets/styles/login.scss';
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
  flex-direction: column;
  background: radial-gradient(220% 105% at top center, #1b2947 10%, #4b76a7 40%, #81acae 65%, #f7f7b6);
}
.login-form {
  padding: 15px 25px 15px 25px;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  // color: #fff;
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.register-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.register-code-img {
  height: 38px;
}
</style>
