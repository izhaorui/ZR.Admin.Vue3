<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="Refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:menu:add']">{{ $t('btn.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">{{ $t('btn.expand') }}/{{ $t('btn.collapse') }}</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template #default="scope">
          <svg-icon :name="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="menuType" label="类型" align="center" width="80">
        <template #default="scope">
          <el-tag type="danger" v-if="scope.row.menuType == 'M' && scope.row.isFrame == 1">链接</el-tag>
          <el-tag v-else-if="scope.row.menuType == 'C'">菜单</el-tag>
          <el-tag type="success" v-else-if="scope.row.menuType == 'M'">目录</el-tag>
          <el-tag type="warning" v-else-if="scope.row.menuType == 'F'">按钮</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="orderNum" label="排序" width="60" align="center"></el-table-column> -->
      <el-table-column prop="orderNum" label="排序" width="90" sortable align="center">
        <template #default="scope">
          <span v-show="editIndex != scope.$index" @click="editCurrRow(scope.$index)">{{ scope.row.orderNum }}</span>
          <el-input :id="scope.$index" v-show="editIndex == scope.$index" v-model="scope.row.orderNum" @blur="handleChangeSort(scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="visible" label="显示" width="70">
        <template #default="scope">
          <dict-tag :options="sys_show_hide" :value="scope.row.visible" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']">{{ $t('btn.edit') }}</el-button>
          <el-button type="text" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']">{{ $t('btn.add') }}</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']">{{ $t('btn.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" v-model="open" width="680px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :lg="24">
            <el-form-item label="上级菜单">
              <el-cascader
                class="w100"
                :options="menuOptions"
                :props="{ checkStrictly: true, value: 'menuId', label: 'menuName', emitPath: false }"
                placeholder="请选择上级菜单"
                clearable
                v-model="form.parentId"
              >
                <template #default="{ node, data }">
                  <span>{{ data.menuName }}</span>
                  <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                </template>
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="多语言key" prop="menuNameKey">
              <template #label>
                <el-tooltip content="多语言翻译key：eg：menu.system" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                多语言key
              </template>
              <el-input v-model="form.menuNameKey" placeholder="请输入多语言菜单key" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :lg="24" v-if="form.menuType != 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover placement="bottom-start" :width="540" v-model:visible="showChooseIcon" trigger="click" @show="showSelectIcon">
                <template #reference>
                  <el-input v-model="form.icon" placeholder="点击选择图标" @click="showSelectIcon" readonly>
                    <template #prefix>
                      <svg-icon v-if="form.icon" :name="form.icon" class="el-input__icon" />
                      <el-icon class="el-input__icon" v-else>
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" @selected="selected" />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item>
              <template #label>
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                是否外链
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <template #label>
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                路由地址
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <template #label>
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                组件路径
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'M'">
            <el-form-item>
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
              <template #label>
                <el-tooltip content="控制器中定义的权限字符，如：[ActionPermissionFilter(Permission = 'system:user:delete')])" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                权限字符
              </template>
            </el-form-item>
          </el-col>
          <!-- <el-col :lg="12" v-if="form.menuType == 'C'">
            <el-form-item>
              <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
              <template #label>
                <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                路由参数
              </template>
            </el-form-item>
          </el-col> -->
          <el-col :lg="12" v-if="form.menuType == 'C'">
            <el-form-item prop="isCache">
              <template #label>
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                是否缓存
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">缓存</el-radio>
                <el-radio label="1">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item prop="visible">
              <template #label>
                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                显示状态
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in sys_show_hide" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item>
              <template #label>
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                菜单状态
              </template>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
          <el-button @click="cancel">{{ $t('btn.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="sysmenu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu, changeMenuSort as changeSort } from '@/api/system/menu'
import SvgIcon from '@/components/SvgIcon'
import IconSelect from '@/components/IconSelect'

const { proxy } = getCurrentInstance()

var dictParams = [{ dictType: 'sys_show_hide' }, { dictType: 'sys_normal_disable' }]
const menuList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const menuOptions = ref([])
const isExpandAll = ref(false)
const refreshTable = ref(true)
const showChooseIcon = ref(false)
const iconSelectRef = ref(null)
const menuRef = ref(null)

const state = reactive({
  form: {},
  queryParams: {
    menuName: undefined,
    visible: undefined,
  },
  rules: {
    menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
    menuNameKey: [{ pattern: /^[A-Za-z].+$/, message: '输入格式不正确', trigger: 'blur' }],
    orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
    path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
    visible: [{ required: true, message: '显示状态不能为空', trigger: 'blur' }],
  },
  sys_show_hide: [],
  sys_normal_disable: [],
})

proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    state[element.dictType] = element.list
  })
})

const { queryParams, form, rules, sys_show_hide, sys_normal_disable } = toRefs(state)

/** 查询菜单列表 */
function getList() {
  loading.value = true
  listMenu(queryParams.value).then((response) => {
    menuList.value = response.data
    loading.value = false
  })
}
/** 查询菜单下拉树结构 */
function getTreeselect() {
  listMenu().then((response) => {
    menuOptions.value = response.data
    // const menu = { menuId: 0, menuName: '根菜单', children: [] }

    // menu.children = response.data
    // menuOptions.value.push(menu)
  })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    orderNum: 999,
    isFrame: '0',
    isCache: '0',
    visible: '0',
    status: '0',
  }
  proxy.resetForm('menuRef')
}
/** 展示下拉图标 */
function showSelectIcon() {
  iconSelectRef.value.reset()
  showChooseIcon.value = true
}
/** 选择图标 */
function selected(name) {
  form.value.icon = name
  showChooseIcon.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd(row) {
  reset()
  getTreeselect()
  if (row != null && row.menuId != undefined) {
    form.value.parentId = row.menuId
  } else {
    form.value.parentId = 0
  }
  open.value = true
  title.value = '添加菜单'
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  getTreeselect()
  getMenu(row.menuId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改菜单'
  })
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['menuRef'].validate((valid) => {
    if (valid) {
      if (form.value.menuId != undefined) {
        updateMenu(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addMenu(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal
    .confirm('是否确认删除名称为"' + row.menuName + '"的数据项?')
    .then(function () {
      return delMenu(row.menuId)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
// ******************自定义编辑 start **********************

const editIndex = ref(-1)
// 显示编辑排序
function editCurrRow(rowId) {
  editIndex.value = rowId

  setTimeout(() => {
    document.getElementById(rowId).focus()
  }, 100)
}
// 保存排序
function handleChangeSort(info) {
  editIndex.value = -1
  proxy
    .$confirm('是否保存数据?')
    .then(function () {
      return changeSort({ value: info.orderNum, id: info.menuId })
    })
    .then(() => {
      handleQuery()
      proxy.$modal.msgSuccess('修改成功')
    })
    .catch(() => {
      handleQuery()
    })
}
// ******************自定义编辑 end **********************
getList()
</script>
