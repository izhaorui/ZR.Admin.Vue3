<template>
  <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form" v-show="loginType == 1">
    <el-form-item prop="phoneNum">
      <el-input v-model="loginForm.phoneNum" type="phone" :maxlength="11" auto-complete="off" :placeholder="$t('login.input_phoneNum')">
        <template #prefix>
          <svg-icon name="phone" class="input-icon" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="phoneCode">
      <el-input v-model="loginForm.phoneCode" type="number" auto-complete="off" :placeholder="$t('login.phoneCode')" @keyup.enter="handleLogin">
        <template #prefix>
          <svg-icon name="validCode" class="input-icon" />
        </template>
        <template #append>
          <el-button @click="handleSendCode" v-if="!showCounddown">{{ $t('login.sendPhoneCode') }}</el-button>
          <el-countdown :value="countdownValue" format="mm:ss" @finish="handleFinish" v-else />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="code" v-if="captchaOnOff != 'off'">
      <el-input v-model="loginForm.code" auto-complete="off" :placeholder="$t('login.captcha')" style="width: 63%" @keyup.enter="handleLogin">
        <template #prefix>
          <svg-icon name="validCode" class="input-icon" />
        </template>
      </el-input>
      <div class="login-code">
        <el-image :src="codeUrl" @click="getCode" class="login-code-img" />
      </div>
    </el-form-item>

    <el-form-item style="width: 100%" :style="{ 'margin-top': captchaOnOff == 'off' ? '40px' : '' }">
      <el-button :loading="loading" size="default" round type="primary" style="width: 100%" @click.prevent="handleLogin">
        <span v-if="!loading">{{ $t('login.btnLogin') }}</span>
        <span v-else>登 录 中...</span>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup name="phonelogin">
import { getCodeImg } from '@/api/system/login'
// import useUserStore from '@/store/modules/user'

const route = useRoute()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  password: '',
  rememberMe: false,
  code: '',
  uuid: '',
  phoneCode: '',
  phoneNum: ''
})

const loginRules = {
  phoneNum: [{ required: true, trigger: 'blur', message: '请输入手机号码', pattern: /^1\d{10}$/ }],
  phoneCode: [{ required: true, trigger: 'blur', message: '请输入短信验证码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}
const loginType = ref(1)
const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaOnOff = ref('')
const redirect = ref()
redirect.value = route.query.redirect

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在cookie中设置记住用户名和密码
      proxy.$modal.msg('敬请期待')
    }
  })
}

function getCode() {
  getCodeImg().then((res) => {
    codeUrl.value = 'data:image/gif;base64,' + res.data.img
    loginForm.value.uuid = res.data.uuid
    captchaOnOff.value = res.data.captchaOff
  })
}
const showCounddown = ref(false)
const countdownValue = ref(0)
function handleSendCode() {
  showCounddown.value = true
  countdownValue.value = Date.now() + 1000 * 60
}
function handleFinish() {
  showCounddown.value = false
}
getCode()
</script>

<style lang="scss" scoped>
@import '@/assets/styles/login.scss';
</style>
