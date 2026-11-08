import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'

let loadingInstance

const BOX_TITLE = '系统提示'
const BOX_OPTIONS = { confirmButtonText: '确定', cancelButtonText: '取消' }

/**
 * 统一弹框参数。
 * 兼容两种调用：`confirm(content)` 与 `confirm(content, title, options)`，
 * 后者是老页面 `proxy.$confirm(msg, '警告', {...})` 的写法。
 */
function boxOptions(type, options) {
  return { ...BOX_OPTIONS, type, ...options }
}

/**
 * 弹框取消/关闭会 reject，老调用方几乎都只写了 `.then()`，
 * 不吞掉就会产生大量无用的一 unhandledrejection。取消不是错误，这里统一转成 resolve。
 */
function ignoreCancel(promise) {
  return promise.catch(() => {})
}

export default {
  // 消息提示
  msg(content) {
    ElMessage.info(content)
  },
  // 错误消息
  msgError(content) {
    ElMessage.error(content)
  },
  // 成功消息
  msgSuccess(content) {
    ElMessage.success(content)
  },
  // 警告消息
  msgWarning(content) {
    ElMessage.warning(content)
  },
  // 弹出提示
  alert(content, title = BOX_TITLE, options) {
    return ignoreCancel(ElMessageBox.alert(content, title, boxOptions('info', options)))
  },
  // 错误提示
  alertError(content, title = BOX_TITLE, options) {
    return ignoreCancel(ElMessageBox.alert(content, title, boxOptions('error', options)))
  },
  // 成功提示
  alertSuccess(content, title = BOX_TITLE, options) {
    return ignoreCancel(ElMessageBox.alert(content, title, boxOptions('success', options)))
  },
  // 警告提示
  alertWarning(content, title = BOX_TITLE, options) {
    return ignoreCancel(ElMessageBox.alert(content, title, boxOptions('warning', options)))
  },
  // 通知提示
  notify(content) {
    ElNotification.info(content)
  },
  // 错误通知
  notifyError(content) {
    ElNotification.error(content)
  },
  // 成功通知
  notifySuccess(content) {
    ElNotification.success(content)
  },
  // 警告通知
  notifyWarning(content) {
    ElNotification.warning(content)
  },
  // 确认窗体
  confirm(content, title = BOX_TITLE, options) {
    return ignoreCancel(ElMessageBox.confirm(content, title, boxOptions('warning', options)))
  },
  // 提交内容
  prompt(content, title = BOX_TITLE, options) {
    return ignoreCancel(ElMessageBox.prompt(content, title, boxOptions('warning', options)))
  },
  // 打开遮罩层
  loading(content) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: 'rgba(0, 0, 0, 0.7)'
    })
  },
  // 关闭遮罩层
  closeLoading() {
    loadingInstance?.close()
  }
}
