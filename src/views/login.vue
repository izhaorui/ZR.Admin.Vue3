<template>
  <div class="login-container">
    <brandPanel />
    <starBackground></starBackground>

    <!-- 右侧登录表单区 -->
    <div class="form-panel">
      <div class="login-card">
        <LangSelect title="多语言设置" class="langSet" />

        <h3 class="card-title">{{ defaultSettings.title }}</h3>
        <p class="card-subtitle">欢迎回来，请登录您的账号</p>

        <div class="tabs-wrap">
          <el-tabs v-model="loginType" @tab-click="handleLoginType">
            <el-tab-pane :label="$t('login.loginway1')" :name="1"></el-tab-pane>
            <el-tab-pane :label="$t('login.loginway2')" :name="2" v-if="defaultSettings.showPhoneLogin"></el-tab-pane>
            <el-tab-pane :label="$t('login.loginway3')" :name="3" v-if="defaultSettings.showQrLogin"></el-tab-pane>
          </el-tabs>
        </div>

        <!-- 必须是真正的 form 提交：浏览器密码管理器只在 submit 时记录/回填账号密码 -->
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form" v-if="loginType == 1" @submit.prevent="handleLogin">
          <el-form-item prop="tenantId" v-show="defaultSettings.showTenant">
            <el-select v-model="loginForm.tenantId" size="default" placeholder="请选择租户" style="width: 100%" @change="handleTenantId">
              <el-option value="tenant0" label="默认租户"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              name="username"
              autocomplete="username"
              :placeholder="$t('login.account')">
              <template #prefix>
                <svg-icon name="user" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              show-password
              type="password"
              name="password"
              autocomplete="current-password"
              :placeholder="$t('login.password')">
              <template #prefix>
                <svg-icon name="password" class="input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="code" v-if="captchaOnOff != 'off'">
            <el-input v-model="loginForm.code" autocomplete="off" :placeholder="$t('login.captcha')" style="width: 63%">
              <template #prefix>
                <svg-icon name="validCode" class="input-icon" />
              </template>
            </el-input>
            <div class="login-code">
              <el-image :src="codeUrl" @click="getCode" class="login-code-img" />
            </div>
          </el-form-item>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <el-checkbox v-model="loginForm.rememberMe">{{ $t('login.rememberMe') }}</el-checkbox>
            <span style="font-size: 12px">
              <router-link class="link-type" :to="'/register'">{{ $t('login.register') }}</router-link>
              <span @click="handleForgetPwd()" class="forget-pwd">{{ $t('login.forgotPwd') }}</span>
            </span>
          </div>

          <el-form-item style="width: 100%" :style="{ 'margin-top': captchaOnOff == 'off' ? '20px' : '' }">
            <el-button :loading="loading" size="default" round type="primary" native-type="submit" class="login-btn">
              <span v-if="!loading">{{ $t('login.btnLogin') }}</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <qrLogin ref="qrLoginRef" v-if="loginType == 3"></qrLogin>
        <phoneLogin v-if="loginType == 2"></phoneLogin>
        <oauthLogin v-if="defaultSettings.showOtherLogin"></oauthLogin>
      </div>
    </div>
  </div>

  <div class="el-login-footer">
    <div v-html="defaultSettings.copyright"></div>
  </div>
</template>

<script setup name="login">
import { getCodeImg } from '@/api/system/login'
import Cookies from 'js-cookie'
import { getClientId } from '@/utils/clientId'
import defaultSettings from '@/settings'
import { ElNotification } from 'element-plus'
import starBackground from '@/views/components/starBackground.vue'
import LangSelect from '@/components/LangSelect/index.vue'
import useUserStore from '@/store/modules/user'
import oauthLogin from './components/Login/oauthLogin.vue'
import phoneLogin from './components/Login/phoneLogin.vue'
import qrLogin from './components/Login/qrLogin.vue'
import brandPanel from './components/Login/brandPanel.vue'

const userStore = useUserStore()
// 设备标识：本地随机值（见 utils/clientId.js），不再从第三方 CDN 动态加载指纹脚本
userStore.setClientId(getClientId())
const router = useRouter()
const route = useRoute()
const { proxy } = getCurrentInstance()

// 记住账号的 cookie 命名空间。
// cookie 的作用域只按「域名 + 路径」划分，不区分端口，本地多个 localhost 项目会共用
// 同名 cookie，导致 A 项目记住的账号被 B 项目套用。这里用「项目标识 + 后端地址 + 当前站点」做隔离。
const rememberNs = [import.meta.env.VITE_APP_KEY || 'zrlogin', import.meta.env.VITE_APP_API_HOST, window.location.origin]
  .map((v) => String(v || 'default').replace(/[^a-zA-Z0-9]/g, '_'))
  .join('_')
// 只记住用户名：密码不再写入 cookie（原先存的是 RSA 密文，同源脚本/XSS 可直接解密复用），
// 密码改由浏览器密码管理器通过 autocomplete="current-password" 托管。
const rememberKeys = {
  username: `${rememberNs}_username`,
  // 历史版本存过加密密码，保留键名仅用于清理
  legacyPassword: `${rememberNs}_password`,
  legacyRememberMe: `${rememberNs}_rememberMe`
}

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: '',
  tenantId: userStore.tenantId
})
const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}
const loginType = computed({
  get: () => userStore.loginType,
  set: (val) => {
    userStore.loginType = val
  }
})
const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaOnOff = ref('')
const redirect = ref()
redirect.value = route.query.redirect
watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
  },
  { immediate: true }
)
function handleLogin() {
  if (loading.value) return
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住账号则把用户名写入 cookie（键名带项目命名空间，避免多项目串用），密码不落盘
      if (loginForm.value.rememberMe) {
        Cookies.set(rememberKeys.username, loginForm.value.username, { expires: 7 })
      } else {
        Cookies.remove(rememberKeys.username)
      }
      // 清理历史版本遗留的密码/记住标记 cookie，避免密文长期留在浏览器
      Cookies.remove(rememberKeys.legacyPassword)
      Cookies.remove(rememberKeys.legacyRememberMe)
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then((res) => {
          if (res?.notice) {
            ElNotification({
              title: '登录提醒',
              message: res.notice,
              type: 'warning',
              duration: 0,
              dangerouslyUseHTMLString: false
            })
          }
          proxy.$modal.msgSuccess(proxy.$t('login.loginSuccess'))
          const query = route.query
          const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
            if (cur !== 'redirect') {
              acc[cur] = query[cur]
            }
            return acc
          }, {})
          router.push({ path: redirect.value || '/', query: otherQueryParams })
        })
        .catch((error) => {
          console.error(error)
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
    codeUrl.value = res.data.img
    loginForm.value.uuid = res.data.uuid
    captchaOnOff.value = res.data.captchaOff
  })
}

function getCookie() {
  // 只回填用户名与勾选状态，密码交给浏览器密码管理器
  const username = Cookies.get(rememberKeys.username)
  loginForm.value.username = username === undefined ? loginForm.value.username : username
  loginForm.value.rememberMe = username !== undefined
  // 迁移清理：删除历史版本在本域名下写入的全局同名 cookie（不区分项目的旧键，正是串号的根源）
  Cookies.remove('password')
}
function handleForgetPwd() {
  proxy.$modal.msg('请联系管理员')
}

function handleLoginType(t) {
  // const val = t.paneName

  if (userStore.loginType == 3) {
    nextTick(() => {
      proxy.$refs.qrLoginRef.clearQr()
    })
  }
}
watch(
  () => userStore.loginType,
  (val) => {
    if (val == 3) {
      handleShowQrLogin()
    }
  },
  {
    immediate: true
  }
)
function handleShowQrLogin() {
  nextTick(() => {
    proxy.$refs.qrLoginRef.generateCode()
  })
}

/**
 * 切换租户
 */
function handleTenantId() {
  userStore.tenantId = loginForm.value.tenantId

  getCode()
}
getCode()
getCookie()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/login.scss';
.qrCode {
  width: 160px;
  height: 160px;
  line-height: 160px;
}
</style>
