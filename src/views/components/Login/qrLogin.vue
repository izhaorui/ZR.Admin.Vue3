<template>
  <div class="qr-wrap login-form">
    <div class="login-scan-container">
      <div ref="imgContainerRef" id="imgContainer" class="qrCode"></div>
      <div class="mt10 text-muted">{{ $t('login.tip_scan_code') }}</div>
    </div>
  </div>
</template>
<script setup>
import useUserStore from '@/store/modules/user'
import QRCode from 'qrcodejs2-fixes'
import { verifyScan, generateQrcode } from '@/api/system/login'

const userStore = useUserStore()
const { proxy } = getCurrentInstance()
const interval = ref(null)
const visitorId = computed(() => {
  return userStore.clientId
})
// 生成二维码
function generateCode() {
  clearQr()
  var uuid = getUuid()

  document.getElementById('imgContainer').innerHTML = '正在生成中...'
  generateQrcode({ uuid, deviceId: visitorId.value }).then((res) => {
    const { code, data } = res
    document.getElementById('imgContainer').innerHTML = ''

    if (code == 200) {
      new QRCode(document.getElementById('imgContainer'), {
        // text: 'https://qm.qq.com/cgi-bin/qm/qr?k=kgt4HsckdljU0VM-0kxND6d_igmfuPlL&authKey=r55YUbruiKQ5iwC/folG7KLCmZ++Y4rQVgNlvLbUniUMkbk24Y9+zNuOmOnjAjRc&noverify=0',
        text: JSON.stringify(data.codeContent),
        width: 160,
        height: 160
      })
    }
  })
  interval.value = setInterval(() => {
    verifyScan({ uuid: uuid, deviceId: visitorId.value })
      .then((res) => {
        const { code, data } = res
        if (data.status == -1) {
          clearQr()
          document.getElementById('imgContainer').innerHTML = '二维码已过期'
        } else if (data.status == 2) {
          userStore
            .scanLogin(data)
            .then(() => {
              proxy.$modal.msgSuccess(proxy.$t('login.loginSuccess'))
              router.push({ path: redirect.value || '/' })
            })
            .catch((error) => {
              console.error(error)
              proxy.$modal.msgError(error.msg)
            })
          clearQr()
        }
      })
      .catch(() => {
        clearQr()
      })
  }, 1000)
}

function getUuid() {
  var temp_url = URL.createObjectURL(new Blob())
  var uuid = temp_url.toString().replace('-', '') // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
  URL.revokeObjectURL(temp_url)
  return uuid.substr(uuid.lastIndexOf('/') + 1)
}
function clearQr() {
  clearInterval(interval.value)
  interval.value = null
}
// onMounted(() => {
//   generateCode()
// })
defineExpose({
  clearQr,
  generateCode
})
</script>
<style lang="scss" scoped>
.qrCode {
  width: 160px;
  height: 160px;
  line-height: 160px;
  margin: 0 auto;
}

.login-scan-container {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 20px;
}
</style>
