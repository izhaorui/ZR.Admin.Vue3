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
          <el-option v-for="dict in options.sys_normal_disable" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('m.isShow')" prop="visible">
        <el-select v-model="queryParams.visible" placeholder="显示状态" clearable>
          <el-option v-for="dict in options.sys_show_hide" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
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
      size="small"
      :loading="loading"
      :column-config="{ resizable: true }"
      :tree-config="{
        parentField: 'parentId',
        reserve: true
      }"
      :row-config="{
        keyField: 'menuId'
      }"
      :border="true"
      :scroll-y="{ enabled: true, gt: 20 }"
      :data="menuList">
      <vxe-column field="menuName" :title="$t('m.menuName')" tree-node width="160"> </vxe-column>
      <vxe-column field="menuId" :title="$t('m.menuid')" width="90"></vxe-column>
      <vxe-column field="icon" :title="$t('m.icon')" align="center" width="80">
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
      <vxe-column field="orderNum" :title="$t('m.sort')" width="110" sortable align="center" v-if="columns.showColumn('orderNum')">
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
          <dict-tag :options="options.sys_show_hide" :value="scope.row.visible" />
        </template>
      </vxe-column>
      <vxe-column field="status" :title="$t('m.menuState')" width="80" align="center">
        <template #default="scope">
          <dict-tag :options="options.sys_normal_disable" :value="scope.row.status" />
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
            <el-button text size="small" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']"></el-button>
            <el-button text size="small" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']"></el-button>
            <el-dropdown>
              <el-button size="small" text>
                {{ $t('btn.more') }}
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </el-button>

              <template #dropdown>
                <el-dropdown-menu>
                  <div v-hasPermi="['system:menu:remove']">
                    <el-dropdown-item>
                      <el-button icon="Delete" link @click="handleDelete(scope.row)">删除当前</el-button>
                    </el-dropdown-item>
                  </div>
                  <div v-hasPermi="['system:menu:remove']" class="mt10">
                    <el-dropdown-item>
                      <el-button icon="Delete" type="danger" link @click="handleDeleteAll(scope.row)"> 删除所有 </el-button>
                    </el-dropdown-item>
                  </div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-button-group>
        </template>
      </vxe-column>
    </vxe-table>

    <menuForm ref="menuFormRef" :options="options" :menuOptions="menuOptions" @success="refreshMenu"></menuForm>
  </div>
</template>

<script setup name="sysmenu">
import { delMenu, listMenu, changeMenuSort as changeSort, delAllMenu } from '@/api/system/menu'

import menuForm from '@/views/components/form/menuForm.vue'
const { proxy } = getCurrentInstance()

var dictParams = [{ dictType: 'sys_show_hide' }, { dictType: 'sys_normal_disable' }]
const menuList = ref([])

const loading = ref(true)
const showSearch = ref(true)

const menuOptions = ref([])
const menuQueryOptions = ref([])
const isExpandAll = ref(false)

const listRef = ref(null)
const state = reactive({
  form: {},
  queryParams: {
    menuName: undefined,
    visible: undefined,
    menuTypeIds: 'M,C',
    parentId: undefined
  },
  options: {
    sys_show_hide: [],
    sys_normal_disable: []
  }
})
const { queryParams, options } = toRefs(state)

proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    state.options[element.dictType] = element.list
  })
})
// 列显隐信息
const columns = ref([
  { label: `添加时间`, visible: false, prop: 'createTime' },
  { label: `排序`, visible: true, prop: 'orderNum' }
])

const tableHeight = ref(document.documentElement.scrollHeight - 245 + 'px')

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
getTreeselect()
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
  proxy.$refs.menuFormRef.handleAdd(row)
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

/** 修改按钮操作 */
function handleUpdate(row) {
  proxy.$refs.menuFormRef.handleUpdate(row)
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
}
/** 删除按钮操作 */
function handleDeleteAll(row) {
  proxy.$modal
    .confirm('是否确认删除名称为"' + row.menuName + '"的所有数据项?')
    .then(function () {
      return delAllMenu(row.menuId)
    })
    .then(() => {
      // getList()
      refreshMenu(row.parentId)
      proxy.$modal.msgSuccess('删除成功')
    })
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
