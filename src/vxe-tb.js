import { VxeUI, VxeTable, VxeColumn } from 'vxe-table'
import { VxeIcon, VxeTooltip, VxeLoading } from 'vxe-pc-ui'
import 'vxe-table/styles/cssvar.scss'
import 'vxe-pc-ui/styles/cssvar.scss'
import zhCN from 'vxe-pc-ui/lib/language/zh-CN'

VxeUI.setI18n('zh-CN', zhCN)
VxeUI.setLanguage('zh-CN')

let installed = false
let themeObserved = false

function resolveVxeTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function syncVxeTheme() {
  VxeUI.setTheme(resolveVxeTheme())
}

function observeColorMode() {
  if (themeObserved || typeof MutationObserver === 'undefined') {
    return
  }
  themeObserved = true
  const observer = new MutationObserver(() => {
    syncVxeTheme()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
}

export default function useTable(app) {
  syncVxeTheme()
  observeColorMode()
  if (installed) {
    return
  }
  installed = true
  app.use(VxeIcon)
  app.use(VxeLoading)
  app.use(VxeTooltip)
  app.use(VxeTable)
  app.use(VxeColumn)
}
