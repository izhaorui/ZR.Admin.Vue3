<template>
  <div class="other-login" v-if="defaultSettings.showOtherLogin">
    <div class="other-tip">{{ $t('login.otherLoginWay') }}</div>

    <span @click="onAuth('GITHUB')" title="github"><svg-icon name="github" className="login-icon"></svg-icon></span>
    <span @click="onAuth('GITEE')" title="gitee"><svg-icon name="gitee" className="login-icon"></svg-icon></span>
  </div>
</template>
<script setup>
import defaultSettings from '@/settings'
import useUserStore from '@/store/modules/user'
const userStore = useUserStore()
const { proxy } = getCurrentInstance()
function onAuth(type) {
  userStore.setAuthSource(type)

  switch (type) {
    default:
      // window.location.href = import.meta.env.VITE_APP_BASE_API + '/auth/Authorization?authSource=' + type
      proxy.$modal.msg('接入请看文档https://www.izhaorui.cn/doc/backend/oauth.html')
      break
  }
}
</script>
<style lang="scss" scoped>
.other-login {
  padding: 0px 20px 10px;

  .other-tip {
    text-align: center;
    color: #ccc;
    font-size: 13px;
    margin-top: 10px;
  }

  .login-icon {
    width: 25px;
    height: 25px;
    margin-right: 20px;
    cursor: pointer;
  }
}
</style>
