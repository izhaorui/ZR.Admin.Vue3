// import XEUtils from 'xe-utils'
import { VxeUI, VxeTable, VxeColumn } from 'vxe-table'
import {
  VxeButton,
  VxeButtonGroup,
  VxeCheckbox,
  VxeCheckboxGroup,
  VxeFormItem,
  VxeForm,
  VxeIcon,
  VxeInput,
  VxeModal,
  VxePager,
  VxePulldown,
  VxeRadio,
  VxeRadioButton,
  VxeRadioGroup,
  VxeSelect,
  VxeSwitch,
  VxeTextarea,
  VxeTooltip,
  VxeLoading
} from 'vxe-pc-ui'
// 导入主题变量，也可以重写主题变量
import 'vxe-table/styles/cssvar.scss'
import 'vxe-pc-ui/styles/cssvar.scss'
// 导入默认的语言
import zhCN from 'vxe-pc-ui/lib/language/zh-CN'

VxeUI.setI18n('zh-CN', zhCN)
VxeUI.setLanguage('zh-CN')

function LazyVxeTable(app) {
  app.use(VxeTable)
  app.use(VxeColumn)
  // app.use(VxeColgroup)
  // app.use(VxeGrid)
  // app.use(VxeToolbar)
}

function LazyVxeUI(app) {
  // app.use(VxeButton)
  // app.use(VxeButtonGroup)
  // app.use(VxeCheckbox)
  // app.use(VxeCheckboxGroup)
  // app.use(VxeFormItem)
  // app.use(VxeForm)
  app.use(VxeIcon)
  // app.use(VxeInput)
  // app.use(VxeModal)
  // app.use(VxePager)
  // app.use(VxePulldown)
  // app.use(VxeRadio)
  // app.use(VxeRadioButton)
  // app.use(VxeRadioGroup)
  // app.use(VxeSelect)
  // app.use(VxeSwitch)
  // app.use(VxeTextarea)
  app.use(VxeLoading)
  app.use(VxeTooltip)
}

export default function useTable(app) {
  app.use(LazyVxeUI).use(LazyVxeTable)
}
