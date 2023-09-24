// import XEUtils from 'xe-utils'
import {
  // 全局对象
  // VXETable,
  Icon,
  Column,
  // 表格
  Tooltip,
  Table
} from 'vxe-table'
import 'vxe-table/styles/cssvar.scss'

export default function useTable(app) {
  // 表格功能
  // app.use(Filter)
  // .use(Edit)
  // .use(Menu)
  // .use(Export)
  // .use(Keyboard)
  // .use(Validator)

  // 可选组件
  app
    .use(Column)
    // .use(Colgroup)
    // .use(Grid)
    .use(Tooltip)
    // .use(Toolbar)
    // .use(Pager)
    // .use(Form)
    // .use(FormItem)
    // .use(FormGather)
    // .use(Checkbox)
    // .use(CheckboxGroup)
    // .use(Radio)
    // .use(RadioGroup)
    // .use(RadioButton)
    // .use(Switch)
    // .use(Input)
    // .use(Select)
    // .use(Optgroup)
    // .use(Option)
    // .use(Textarea)
    // .use(Button)
    // .use(Modal)
    // .use(List)
    // .use(Pulldown)

    // 安装表格
    .use(Table)
}
