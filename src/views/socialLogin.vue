<template>
  <starBackground></starBackground>
  <div class="login">
    <el-form ref="loginRef" :model="loginForm" class="login-form">
      <h3 class="title">{{ defaultSettings.title }}</h3>

      <div v-if="!loading" style="text-align: center" class="pb20">
        <el-empty v-if="!loading" description="未获取到授权信息，请返回重新授权登录" />
        <router-link class="link-type" :to="'/login'">返回{{ $t('login.btnLogin') }}</router-link>
      </div>
      <div v-else class="loading">登 录 中...</div>
    </el-form>

    <!--  底部  -->
    <div class="el-login-footer">
      <div v-html="defaultSettings.copyright"></div>
    </div>
  </div>
</template>
<script setup name="socialLogin">
import starBackground from '@/views/components/starBackground.vue'
import { getQueryObject } from '@/utils/index'
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const { proxy } = getCurrentInstance()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loginForm = ref(undefined)
const callbackQuery = ref(undefined)
const redirect = ref(undefined)
const authSource = ref('')
const loading = ref(false)
callbackQuery.value = getQueryObject()
redirect.value = route.query.redirect
authSource.value = route.query.authSource

const userInfo = computed(() => {
  return userStore.userInfo
})
if (callbackQuery.value && callbackQuery.value.state != null) {
  loading.value = true
  // 调用action的登录方法
  userStore
    .oauthLogin(callbackQuery.value, { authSource: authSource.value })
    .then(() => {
      proxy.$modal.msgSuccess(proxy.$t('login.loginSuccess'))
      router.push({ path: redirect.value || '/' })
    })
    .catch((error) => {
      console.error(error)
      proxy.$modal.msgError(error.msg)
      loading.value = false
    })
}
</script>
<style lang="scss" scoped>
@import '@/assets/styles/login.scss';
.loading {
  text-align: center;
  color: #ccc;
	padding: 10px;
}
</style>
