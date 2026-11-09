<template>
  <div class="app-container">
    <el-splitter>
      <!-- 桌面端部门树常驻左栏；移动端改由下方抽屉承载，避免把列表挤成窄条 -->
      <el-splitter-panel v-if="showDeptPanel" size="200px" :collapsible="true" style="padding-right: 10px" max="300px">
        <el-card>
          <dept-tree ref="deptTreeRef" :dept-options="deptOptions" :current-key="queryParams.deptId" @node-click="handleNodeClick"></dept-tree>
        </el-card>
      </el-splitter-panel>
      <el-splitter-panel>
        <div style="padding: 10px">
          <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="用户名称" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 240px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
                <el-option label="全部" :value="-1" />
                <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="dateRange"
                style="width: 240px"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
              <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb8">
            <!-- 移动端部门树在抽屉里，点这里打开；选完部门会自动关闭 -->
            <el-col :span="1.5" v-if="isMobile">
              <el-button type="info" plain icon="OfficeBuilding" @click="deptDrawerOpen = true">部门</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:user:add']">
                {{ $t('btn.add') }}
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:user:edit']">
                {{ $t('btn.edit') }}
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">
                {{ $t('btn.delete') }}
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['system:user:import']">
                {{ $t('btn.import') }}
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:user:export']">
                {{ $t('btn.export') }}
              </el-button>
            </el-col>

            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
          </el-row>

          <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
            <el-table-column label="用户编号" align="center" key="userId" prop="userId" v-if="columns.showColumn('userId')" />
            <el-table-column label="用户名称" align="center" key="userName" v-if="columns.showColumn('userName')" :show-overflow-tooltip="true">
              <template #default="scope">
                <a class="link-type" style="cursor: pointer" @click="handleViewData(scope.row)">{{ scope.row.userName }}</a>
              </template>
            </el-table-column>
            <el-table-column
              label="用户昵称"
              align="center"
              key="nickName"
              prop="nickName"
              v-if="columns.showColumn('nickName')"
              :show-overflow-tooltip="true" />
            <el-table-column
              label="部门"
              align="center"
              key="deptName"
              prop="deptName"
              v-if="columns.showColumn('deptName')"
              :show-overflow-tooltip="true" />
            <el-table-column
              label="手机号码"
              align="center"
              key="phonenumber"
              prop="phonenumber"
              v-if="columns.showColumn('phonenumber')"
              width="120" />
            <el-table-column label="启用" align="center" key="status" v-if="columns.showColumn('status')">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="0"
                  :inactive-value="1"
                  active-text="是"
                  inactive-text="否"
                  inline-prompt
                  @change="handleStatusChange(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              align="center"
              prop="createTime"
              v-if="columns.showColumn('createTime')"
              width="160"></el-table-column>
            <el-table-column prop="sex" label="性别" align="center" v-if="columns.showColumn('sex')">
              <template #default="scope">
                <dict-tag :options="sexOptions" :value="scope.row.sex" />
              </template>
            </el-table-column>
            <el-table-column prop="avatar" label="头像" align="center" v-if="columns.showColumn('avatar')">
              <template #default="scope">
                <el-avatar :src="scope.row.avatar" />
              </template>
            </el-table-column>
            <el-table-column prop="email" label="用户邮箱" v-if="columns.showColumn('email')" />
            <el-table-column prop="loginDate" label="最后登录时间" align="center" v-if="columns.showColumn('loginDate')" />
            <el-table-column label="操作" align="left" width="110" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button text icon="Edit" v-if="scope.row.userId !== 1" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']">
                </el-button>
                <el-button v-if="!scope.row.isAdmin" text icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']">
                </el-button>
                <el-button
                  v-if="scope.row.userId !== 1"
                  text
                  icon="Key"
                  title="重置密码"
                  @click="handleResetPwd(scope.row)"
                  v-hasPermi="['system:user:resetPwd']"></el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </div>
      </el-splitter-panel>
    </el-splitter>

    <!-- 移动端部门树：从左侧滑出，列表宽度不受影响；选完部门自动关闭 -->
    <el-drawer v-if="isMobile" v-model="deptDrawerOpen" title="部门筛选" direction="ltr" size="78%" append-to-body destroy-on-close>
      <dept-tree :dept-options="deptOptions" :current-key="queryParams.deptId" @node-click="handleNodeClick"></dept-tree>
    </el-drawer>

    <UserFormDialog
      v-if="open"
      ref="userFormRef"
      v-model="open"
      :title="title"
      :form="form"
      :rules="rules"
      :dept-options="deptOptions"
      :sex-options="sexOptions"
      :status-options="statusOptions"
      :post-options="postOptions"
      :role-options="roleOptions"
      @cancel="cancel"
      @select-role="selectRole"
      @submit="submitForm" />

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload
        name="file"
        ref="uploadRef"
        :limit="1"
        accept=".xlsx,.xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag>
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <!-- <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
            </div> -->
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" underline="never" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="upload.open = false">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitFileForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog :title="'重置「' + resetPwd.userName + '」的密码'" v-model="resetPwd.open" width="420px" append-to-body>
      <el-form :model="resetPwd" :rules="resetPwdRules" ref="resetPwdRef" label-width="80px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPwd.password" show-password maxlength="32" placeholder="请输入新密码">
            <template #append>
              <el-button @click="changeRandomPassword">随机生成</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwd.open = false">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" :loading="resetPwd.loading" @click="submitResetPwd">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- 用戶詳情 -->
    <user-view-drawer ref="userViewDrawerRef"></user-view-drawer>
  </div>
</template>

<script setup name="user">
import { getToken } from '@/utils/auth'
import { treeselect } from '@/api/system/dept'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, exportUser } from '@/api/system/user'
import UserViewDrawer from './view.vue'
import DeptTree from './dept-tree.vue'

const UserFormDialog = defineAsyncComponent(() => import('./components/UserFormDialog.vue'))
const { proxy } = getCurrentInstance()
const userFormRef = ref()

const statusOptions = ref([])
const sexOptions = ref([])
proxy.getDicts('sys_normal_disable').then((response) => {
  statusOptions.value = response.data
})
proxy.getDicts('sys_user_sex').then((response) => {
  sexOptions.value = response.data
})
const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const deptOptions = ref([])
const initPassword = ref(undefined)
const postOptions = ref([])
const roleOptions = ref([])
// 移动端（<= 768px）：部门树收进左侧抽屉，不再与列表并排，避免把列表挤成窄条。
// 同步取初值，避免首帧先按桌面端渲染出部门树再切换（闪一下）
const isMobile = ref(window.innerWidth <= 768)
const deptDrawerOpen = ref(false)
// 桌面端部门树常驻左栏，移动端交给抽屉
const showDeptPanel = computed(() => !isMobile.value)
const updateIsMobile = () => {
  const next = window.innerWidth <= 768
  if (next === isMobile.value) return
  isMobile.value = next
  // 跨断点时收起抽屉，避免遮罩残留
  deptDrawerOpen.value = false
}
onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
})
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: 'Bearer ' + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/system/user/importData'
})
/** 重置密码弹框：预填随机密码，且可反复点「随机生成」更换 */
const resetPwd = reactive({
  open: false,
  loading: false,
  userId: undefined,
  userName: '',
  password: ''
})
const resetPwdRef = ref()
const resetPwdRules = {
  password: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    // 与后端密码策略（sys.account.pwd.*，默认 8-32 位）保持一致
    { min: 8, max: 32, message: '新密码长度必须介于 8 和 32 之间，且需包含数字和字母', trigger: 'blur' }
  ]
}
// 列显隐信息
const columns = ref([
  { key: 0, label: `用户编号`, visible: true, prop: 'userId' },
  { key: 1, label: `用户名称`, visible: true, prop: 'userName' },
  { key: 2, label: `用户昵称`, visible: true, prop: 'nickName' },
  { key: 3, label: `部门`, visible: true, prop: 'deptName' },
  { key: 4, label: `手机号码`, visible: true, prop: 'phonenumber' },
  { key: 5, label: `状态`, visible: true, prop: 'status' },
  { key: 6, label: `创建时间`, visible: false, prop: 'createTime' },
  { key: 7, label: `性别`, visible: true, prop: 'sex' },
  { key: 8, label: `头像`, visible: true, prop: 'avatar' },
  { key: 9, label: `邮箱`, visible: false, prop: 'email' },
  { key: 10, label: `最后登录时间`, visible: false, prop: 'loginDate' }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: -1,
    deptId: undefined
  },
  rules: {
    userName: [
      { required: true, message: '用户名称不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: '用户名称长度必须介于 2 和 20 之间',
        trigger: 'blur'
      }
    ],
    nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    // 与后端密码策略（sys.account.pwd.*，默认 8-32 位）保持一致
    password: [
      { required: true, message: '用户密码不能为空', trigger: 'blur' },
      {
        min: 8,
        max: 32,
        message: '用户密码长度必须介于 8 和 32 之间，且需包含数字和字母',
        trigger: 'blur'
      }
    ],
    email: [
      {
        required: true,
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change']
      }
    ],
    phonenumber: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

proxy.getConfigKey('sys.user.initPassword').then((response) => {
  initPassword.value = response.data
})

/** 查询部门下拉树结构 */
function getTreeselect() {
  treeselect().then((response) => {
    deptOptions.value = [{ id: 0, label: '未知部门', children: [] }, ...response.data]
  })
}
/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    userList.value = res.data.result
    total.value = res.data.totalNum
  })
}
/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id
  handleQuery()
  // 移动端选完就关掉抽屉，直接看列表
  if (isMobile.value) deptDrawerOpen.value = false
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  queryParams.value.deptId = undefined
  proxy.$refs.deptTreeRef?.setCurrentKey(null)
  handleQuery()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value
  proxy.$modal
    .confirm('是否确认删除用户编号为"' + userIds + '"的数据项？')
    .then(function () {
      return delUser(userIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  proxy.$modal
    .confirm('是否确认导出所有用户数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await exportUser(queryParams.value)
    })
}
/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status === '0' ? '启用' : '停用'
  proxy.$modal
    .confirm('确认要"' + text + '""' + row.userName + '"用户吗?')
    .then(function () {
      return changeUserStatus(row.userId, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status == 1 ? 0 : 1
    })
}
/**
 * 生成随机密码：字母 + 数字，长度 12-16 位，且必然同时包含这两类字符。
 * 供重置密码弹框预填与「随机生成」更换，运营可以直接用，也可以改成自己指定的密码。
 *
 * 长度下限必须 ≥ 后端密码策略的最短长度（默认 8），否则弹框预填的密码会立刻被校验拦下。
 * 若后端开启了「必须含特殊字符」（sys.account.pwd.requireSymbol=1），此处的字符集需同步补充。
 */
function generateRandomPassword() {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const all = letters + digits
  // 12 ~ 16 位随机长度
  const length = 12 + Math.floor(Math.random() * 5)
  const chars = [
    // 先各放一个字母与数字，保证两类字符一定出现，不会随机出纯数字或纯字母
    letters[Math.floor(Math.random() * letters.length)],
    digits[Math.floor(Math.random() * digits.length)]
  ]
  while (chars.length < length) {
    chars.push(all[Math.floor(Math.random() * all.length)])
  }
  // 打乱顺序，否则字母与数字会固定落在前两位
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = chars[i]
    chars[i] = chars[j]
    chars[j] = temp
  }
  return chars.join('')
}

/** 重置密码按钮操作：打开弹框并预填一个随机密码 */
function handleResetPwd(row) {
  resetPwd.userId = row.userId
  resetPwd.userName = row.userName
  resetPwd.password = generateRandomPassword()
  resetPwd.open = true
  // 弹框是复用实例，清掉上一次可能残留的校验红字
  nextTick(() => resetPwdRef.value?.clearValidate())
}

/** 更换随机密码：可反复点击，每次都是新的一个 */
function changeRandomPassword() {
  resetPwd.password = generateRandomPassword()
  resetPwdRef.value?.clearValidate('password')
}

/** 提交重置密码 */
function submitResetPwd() {
  resetPwdRef.value.validate((valid) => {
    if (!valid) return
    resetPwd.loading = true
    resetUserPwd(resetPwd.userId, resetPwd.password)
      .then(() => {
        // 弹框一关就看不到密码了，必须用提示把新密码显示出来
        proxy.$modal.msgSuccess('修改成功，新密码是：' + resetPwd.password)
        resetPwd.open = false
      })
      .finally(() => {
        resetPwd.loading = false
      })
  })
}
/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.userId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 详情按钮操作 */
function handleViewData(row) {
  proxy.$refs['userViewDrawerRef'].open(row.userId)
}

/** 导入按钮操作 */
function handleImport() {
  upload.title = '用户导入'
  upload.open = true
}
/** 下载模板操作 */
function importTemplate() {
  proxy.download('/system/user/importTemplate', '用户数据导入模板')
}
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true
}
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  const { code, msg, data } = response
  upload.open = false
  upload.isUploading = false
  proxy.$refs['uploadRef'].clearFiles()
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + data.item1 + '</div>', '导入结果', {
    dangerouslyUseHTMLString: true
  })
  getList()
}
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs['uploadRef'].submit()
}
/** 初始化部门数据 */
function initTreeData() {
  // 判断部门的数据是否存在，存在不获取，不存在则获取
  if (deptOptions.value === undefined) {
    treeselect().then((response) => {
      deptOptions.value = response.data
    })
  }
}
/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: 2,
    status: 0,
    remark: undefined,
    postIds: [],
    roleIds: []
  }
  userFormRef.value?.resetFields()
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  initTreeData()
  getUser().then((response) => {
    postOptions.value = response.data.posts
    roleOptions.value = response.data.roles
    open.value = true
    title.value = '添加用户'
    form.value.password = initPassword.value
  })
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  initTreeData()
  const userId = row.userId || ids.value

  getUser(userId).then((response) => {
    var data = response.data
    form.value = {
      userId: data.user.userId,
      deptId: data.user.deptId,
      userName: data.user.userName,
      nickName: data.user.nickName,
      password: '',
      phonenumber: data.user.phonenumber,
      email: data.user.email,
      sex: data.user.sex,
      status: data.user.status,
      remark: data.user.remark,
      postIds: data.postIds,
      roleIds: data.roleIds
    }
    roleOptions.value = response.data.roles
    postOptions.value = response.data.posts
    open.value = true
    title.value = '修改用户'
    form.value.password = ''
  })
}
/** 提交按钮 */
function submitForm() {
  userFormRef.value?.validate((valid) => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addUser(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
function checkSelectable(row) {
  return row.userId != 1 ? true : false
}
/**
 * 解决编辑时角色选中不了问题
 */
function selectRole(e) {
  proxy.$forceUpdate()
}
getTreeselect()
getList()
</script>
<style scoped>
.avatar {
  width: 40px;
}
</style>
