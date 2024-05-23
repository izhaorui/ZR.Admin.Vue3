<template>
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
              <el-radio-button value="M">{{ $t('m.directory') }}M</el-radio-button>
              <el-radio-button value="C">{{ $t('m.menu') }}C</el-radio-button>
              <el-radio-button value="F">{{ $t('m.button') }}F</el-radio-button>
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
        <el-col :lg="12" v-if="form.menuType != 'F'">
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
        <el-col :lg="12">
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
              <el-radio value="0">{{ $t('common.no') }}</el-radio>
              <el-radio value="1">{{ $t('common.yes') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
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
            <!-- <el-radio-group v-model="form.isCache">
                <el-radio value="0">{{ $t('common.yes') }}</el-radio>
                <el-radio value="1">{{ $t('common.no') }}</el-radio>
              </el-radio-group> -->
            <el-switch v-model="form.isCache" active-value="0" inactive-value="1"></el-switch>
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
              <el-radio v-for="dict in options.sys_show_hide" :key="dict.dictValue" :value="dict.dictValue">{{ dict.dictLabel }}</el-radio>
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
              <el-radio v-for="dict in options.sys_normal_disable" :key="dict.dictValue" :value="dict.dictValue">{{ dict.dictLabel }}</el-radio>
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
</template>
<script setup>
import { addMenu, getMenu, updateMenu } from '@/api/system/menu'
import IconSelect from '@/components/IconSelect'
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const iconSelectRef = ref(null)
const open = ref(false)
const title = ref('')
const menuRef = ref(null)

const props = defineProps({
  options: {},
  menuOptions: {}
})
const state = reactive({
  form: {},
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
const { form, rules } = toRefs(state)

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
/** 新增按钮操作 */
function handleAdd(row) {
  reset()
  if (row != null && row.menuId != undefined) {
    form.value.parentId = row.menuId
  } else {
    form.value.parentId = 0
  }
  open.value = true
  title.value = proxy.$t('btn.add')
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
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

          emit('success', form.value.parentId)
          // refreshMenu(form.value.parentId)
        })
      } else {
        addMenu(form.value).then(() => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          // refreshMenu(form.value.parentId)
          emit('success', form.value.parentId)
        })
      }
    }
  })
}

defineExpose({
  handleAdd,
  handleUpdate
})
</script>
