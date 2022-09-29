<template>
  <starBackground></starBackground>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
      <h3 class="title">{{ defaultSettings.title }}</h3>

      <LangSelect title="多语言设置" class="langSet" />
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" type="text" size="default" auto-complete="off" :placeholder="$t('login.account')">
          <template #prefix>
            <svg-icon name="user" class="el-input__icon input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="default"
          auto-complete="off"
          :placeholder="$t('login.password')"
          @keyup.enter="handleLogin">
          <template #prefix>
            <svg-icon name="password" class="el-input__icon input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaOnOff != 'off'">
        <el-input
          v-model="loginForm.code"
          size="default"
          auto-complete="off"
          :placeholder="$t('login.captcha')"
          style="width: 63%"
          @keyup.enter="handleLogin">
          <template #prefix>
            <svg-icon name="validCode" class="el-input__icon input-icon" />
          </template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </el-form-item>

      <div style="display: flex; justify-content: space-between">
        <el-checkbox v-model="loginForm.rememberMe">{{ $t('login.rememberMe') }}</el-checkbox>
        <router-link class="link-type" :to="'/register'">{{ $t('login.register') }}</router-link>
      </div>

      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="default" type="primary" style="width: 100%" @click.prevent="handleLogin">
          <span v-if="!loading">{{ $t('login.btnLogin') }}</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
      <div class="other-login">
        <el-divider>{{ $t('login.otherLoginWay') }}</el-divider>
        <img src="../assets/icons/gitee-fill-round.png" alt="" class="login-icon" @click="onAuth('GITEE')" />
        <img src="../assets/icons/github-fill.png" alt="" class="login-icon" @click="onAuth('GITHUB')" />
        <img src="../assets/icons/wechat-fill.png" alt="" class="login-icon" />
      </div>
    </el-form>

    <!--  底部  -->
    <div class="el-login-footer">
      <div v-html="defaultSettings.copyright"></div>
    </div>
  </div>
</template>

<script setup name="login">
import { getCodeImg } from '@/api/system/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import defaultSettings from '@/settings'
import starBackground from '@/views/components/starBackground.vue'
import LangSelect from '@/components/LangSelect/index.vue'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: ''
})

const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}

const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaOnOff = ref('')
// 注册开关
const register = ref(false)
const redirect = ref()
redirect.value = route.query.redirect
proxy.getConfigKey('sys.account.captchaOnOff').then((response) => {
  captchaOnOff.value = response.data
})

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在cookie中设置记住用户明和名命
      if (loginForm.value.rememberMe) {
        Cookies.set('username', loginForm.value.username, { expires: 30 })
        Cookies.set('password', encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set('rememberMe', loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          proxy.$modal.msgSuccess(proxy.$t('login.loginSuccess'))
          router.push({ path: redirect.value || '/' })
        })
        .catch((error) => {
          console.error(error)
          proxy.$modal.msgError(error.msg)
          loading.value = false
          // 重新获取验证码
          if (captchaOnOff.value) {
            getCode()
          }
        })
    }
  })
}

function getCode() {
  getCodeImg().then((res) => {
    codeUrl.value = 'data:image/gif;base64,' + res.data.img
    loginForm.value.uuid = res.data.uuid
  })
}

function getCookie() {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}
function onAuth(type) {
  userStore.setAuthSource(type)

  switch (type) {
    default:
      window.location.href = import.meta.env.VITE_APP_BASE_API + '/auth/Authorization?authSource=' + type
      break
  }
}
getCode()
getCookie()
</script>

<style lang="scss" scoped>
@import '@/assets/styles/login.scss';
.login-icon {
  width: 30px;
  margin-right: 10px;
  cursor: pointer;
}
.other-login {
  padding: 0px 10px 5px;
}
</style>
