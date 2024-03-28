<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item :label="$t('m.parentMenu')" prop="parentId">
        <el-cascader
          class="w100"
          :options="menuQueryOptions"
          :props="{ checkStrictly: true, value: 'menuId', label: 'menuName', emitPath: false }"
          placeholder="请选择上级菜单"
          clearable
          v-model="queryParams.parentId">
          <template #default="{ node, data }">
            <span>{{ data.menuName }}</span>
            <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item :label="$t('m.menuName')" prop="menuName">
        <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item :label="$t('m.menuState')" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
          <el-option v-for="dict in sys_normal_disable" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('m.isShow')" prop="visible">
        <el-select v-model="queryParams.visible" placeholder="显示状态" clearable>
          <el-option v-for="dict in sys_show_hide" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <vxe-table
      :height="tableHeight"
      show-overflow
      ref="listRef"
      :loading="loading"
      :column-config="{ resizable: true }"
      :tree-config="{
        parentField: 'parentId',
        reserve: true
      }"
      :row-config="{
        keyField: 'menuId'
      }"
      :scroll-y="{ enabled: true, gt: 20 }"
      :data="menuList">
      <vxe-column field="menuName" :title="$t('m.menuName')" tree-node width="160"> </vxe-column>
      <vxe-column field="menuId" :title="$t('m.menuid')" width="90"></vxe-column>
      <vxe-column field="icon" :title="$t('m.icon')" align="center" width="60">
        <template #default="{ row }">
          <svg-icon :name="row.icon"></svg-icon>
        </template>
      </vxe-column>
      <vxe-column field="menuType" :title="$t('m.menuType')" align="center" width="80">
        <template #default="scope">
          <el-tag :disable-transitions="true" type="danger" v-if="scope.row.menuType == 'M' && scope.row.isFrame == 1">{{ $t('m.link') }}</el-tag>
          <el-tag :disable-transitions="true" v-else-if="scope.row.menuType == 'C'">{{ $t('m.menu') }}</el-tag>
          <el-tag :disable-transitions="true" type="success" v-else-if="scope.row.menuType == 'M'">{{ $t('m.directory') }}</el-tag>
          <el-tag :disable-transitions="true" type="warning" v-else-if="scope.row.menuType == 'F'">{{ $t('m.button') }}</el-tag>
        </template>
      </vxe-column>
      <vxe-column field="orderNum" :title="$t('m.sort')" width="90" sortable align="center" v-if="columns.showColumn('orderNum')">
        <template #default="scope">
          <span v-show="editIndex != scope.row.menuId" @click="editCurrRow(scope.row.menuId)">{{ scope.row.orderNum }}</span>
          <el-input
            :ref="setColumnsRef"
            v-show="editIndex == scope.row.menuId"
            v-model="scope.row.orderNum"
            @blur="handleChangeSort(scope.row)"></el-input>
        </template>
      </vxe-column>
      <vxe-column field="perms" :title="$t('m.authorityID')" show-overflow="title"></vxe-column>
      <vxe-column field="component" :title="$t('m.componentPath')" show-overflow></vxe-column>
      <vxe-column field="visible" :title="$t('m.isShow')" width="90" align="center">
        <template #default="scope">
          <dict-tag :options="sys_show_hide" :value="scope.row.visible" />
        </template>
      </vxe-column>
      <vxe-column field="status" :title="$t('m.menuState')" width="80" align="center">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </vxe-column>
      <vxe-column :title="$t('common.addTime')" align="center" field="createTime" show-overflow v-if="columns.showColumn('createTime')">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </vxe-column>
      <vxe-column :title="$t('btn.operate')" align="center" width="140">
        <template #default="scope">
          <el-button-group>
            <el-button text size="small" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']"></el-button>
            <el-button text size="small" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']"></el-button>
            <el-button text size="small" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']"></el-button>
          </el-button-group>
        </template>
      </vxe-column>
    </vxe-table>

    <el-dialog :title="title" v-model="open" width="720px" append-to-body>
      <el-form ref="menuRef" :model="form" :rules="rules" label-width="110px">
        <el-row>
          <el-col :lg="24">
            <el-form-item :label="$t('m.parentMenu')">
              <el-cascader
                class="w100"
                :options="menuOptions"
                :props="{ checkStrictly: true, value: 'menuId', label: 'menuName', emitPath: false }"
                placeholder="请选择上级菜单"
                clearable
                v-model="form.parentId">
                <template #default="{ node, data }">
                  <span>{{ data.menuName }}</span>
                  <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                </template>
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item :label="$t('m.menuType')" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio value="M">{{ $t('m.directory') }}</el-radio>
                <el-radio value="C">{{ $t('m.menu') }}</el-radio>
                <el-radio value="F">{{ $t('m.button') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item :label="$t('m.menuName')" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="菜单名" prop="menuNameKey">
              <template #label>
                <span>
                  <el-tooltip content="多语言翻译key：eg：menu.system，不需要多语言的可不用填写" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.menuNameKey') }}
                </span>
              </template>
              <el-input v-model="form.menuNameKey" placeholder="请输入菜单名翻译key" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item :label="$t('m.icon')" prop="icon">
              <el-popover placement="bottom-start" :width="540" trigger="click">
                <template #reference>
                  <el-input v-model="form.icon" placeholder="点击选择图标" readonly>
                    <template #prefix>
                      <svg-icon v-if="form.icon" :name="form.icon" />
                      <el-icon v-else>
                        <search />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" @selected="selected" />
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item :label="$t('m.sort')" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.isFrame') }}
                </span>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio value="1">{{ $t('common.yes') }}</el-radio>
                <el-radio value="0">{{ $t('common.no') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.routePath') }}
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.componentPath') }}
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径">
                <template #prepend>
                  <span style="width: 40px">src/views/</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'M'">
            <el-form-item>
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
              <template #label>
                <span>
                  <el-tooltip content="控制器中定义的权限字符，如：[ActionPermissionFilter(Permission = 'system:user:delete')])" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.permissionStr') }}
                </span>
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
                <span>
                  <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.isCache') }}
                </span>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio value="0">{{ $t('common.yes') }}</el-radio>
                <el-radio value="1">{{ $t('common.no') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item prop="visible">
              <template #label>
                <span>
                  <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.isShow') }}
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in sys_show_hide" :key="dict.dictValue" :value="dict.dictValue">{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType != 'F'">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  {{ $t('m.menuState') }}
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.dictValue" :value="dict.dictValue">{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="sysmenu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu, changeMenuSort as changeSort, listMenuById } from '@/api/system/menu'
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
const menuQueryOptions = ref([])
const isExpandAll = ref(false)
const iconSelectRef = ref(null)
const menuRef = ref(null)
const listRef = ref(null)
const state = reactive({
  form: {},
  queryParams: {
    menuName: undefined,
    visible: undefined,
    menuTypeIds: 'M,C',
    parentId: undefined
  },
  rules: {
    menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
    menuNameKey: [{ pattern: /^[A-Za-z].+$/, message: '输入格式不正确', trigger: 'blur' }],
    orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
    path: [
      { required: false, message: '路由地址不能为空', trigger: 'blur' },
      { pattern: /^[/A-Za-z].+$/, message: '输入格式不正确，字母开头', trigger: 'blur' }
    ],
    visible: [{ required: true, message: '显示状态不能为空', trigger: 'blur' }]
  },
  sys_show_hide: [],
  sys_normal_disable: []
})

proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    state[element.dictType] = element.list
  })
})
// 列显隐信息
const columns = ref([
  { label: `添加时间`, visible: false, prop: 'createTime' },
  { label: `排序`, visible: true, prop: 'orderNum' }
])

const tableHeight = ref(document.documentElement.scrollHeight - 245 + 'px')
const { queryParams, form, rules, sys_show_hide, sys_normal_disable } = toRefs(state)

/** 查询菜单列表 */
function getList(type) {
  loading.value = true
  if (queryParams.value.parentId != undefined || queryParams.value.menuName != undefined) {
    queryParams.value.menuTypeIds = ''
  } else {
    queryParams.value.menuTypeIds = 'M,C,F'
  }
  listMenu(queryParams.value).then((response) => {
    menuList.value = response.data
    if (type == 1) {
      menuQueryOptions.value = response.data
    }
    loading.value = false
  })
}
/** 查询菜单下拉树结构 */
function getTreeselect() {
  listMenu({ menuTypeIds: 'M,C,F' }).then((response) => {
    menuOptions.value = response.data
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
    status: '0'
  }
  proxy.resetForm('menuRef')
}

/** 选择图标 */
function selected(name) {
  form.value.icon = name
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
  title.value = proxy.$t('btn.add')
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  // refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  // nextTick(() => {
  //   refreshTable.value = true
  // })
  const $table = listRef.value
  if ($table) {
    if (isExpandAll.value) {
      $table.setAllTreeExpand(true)
    } else {
      $table.clearTreeExpand()
    }
  }
}
const hasExpandRow = (row) => {
  const $table = listRef.value
  if ($table) {
    return $table.isTreeExpandByRow(row)
  }
  return false
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  getTreeselect()
  getMenu(row.menuId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = proxy.$t('btn.edit')
  })
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['menuRef'].validate((valid) => {
    if (valid) {
      if (form.value.menuId != undefined) {
        updateMenu(form.value).then(() => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          refreshMenu(form.value.parentId)
        })
      } else {
        addMenu(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          refreshMenu(form.value.parentId)
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
      // getList()
      refreshMenu(row.parentId)
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
// ******************自定义编辑 start **********************
// 动态ref设置值
const columnRefs = ref([])
const setColumnsRef = (el) => {
  if (el) {
    columnRefs.value.push(el)
  }
}
const editIndex = ref(-1)
// 显示编辑排序
function editCurrRow(rowId) {
  editIndex.value = rowId

  setTimeout(() => {
    columnRefs.value[rowId].focus()
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
      refreshMenu(info.parentId)
      proxy.$modal.msgSuccess('修改成功')
    })
    .catch(() => {
      handleQuery()
    })
}
// ******************自定义编辑 end **********************
// 刷新懒加载后的数据
function refreshMenu(pid) {
  loading.value = true

  getList()
}

listMenu({ menuTypeIds: 'M,C' }).then((response) => {
  menuQueryOptions.value = response.data
})

// 首次列表加载（只加载一层）
// getList(1)
handleQuery()
</script>
