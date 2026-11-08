import { ElMessage } from 'element-plus'
import tab from './tab'
import auth from './auth'
import cache from './cache'
import modal from './modal'
import download from './download'

export default function installPlugins(app) {
  // 页签操作
  app.config.globalProperties.$tab = tab
  // 认证对象
  app.config.globalProperties.$auth = auth
  // 缓存对象
  app.config.globalProperties.$cache = cache
  // 模态框对象
  app.config.globalProperties.$modal = modal
  // 下载文件
  app.config.globalProperties.$download = download
  // 兼容老页面的短写法：36 个页面用 proxy.$confirm(...)、少数用 $alert/$prompt/$message，
  // 这些名字此前从未注册，点击删除/导出会抛 TypeError 并静默失败
  app.config.globalProperties.$confirm = modal.confirm
  app.config.globalProperties.$alert = modal.alert
  app.config.globalProperties.$prompt = modal.prompt
  app.config.globalProperties.$message = ElMessage

  Array.prototype.showColumn = function (column) {
    var item = this.find((x) => x.prop == column)
    // console.log('showColumn方法', this, column, item)
    if (item) {
      return item.visible
    }
    return true
  }
}
