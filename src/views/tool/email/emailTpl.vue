<!--
 * @Descripttion: (邮件模板/emailTpl)
 * @Author: (zz)
 * @Date: (2023-11-12)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="如 workflow.notify" />
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['tool:emailtpl:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table
      :data="dataList"
      v-loading="loading"
      ref="table"
      border
      header-cell-class-name="el-table-header-cell"
      highlight-current-row
      @sort-change="sortChange">
      <el-table-column prop="id" label="Id" align="center" />
      <el-table-column prop="name" label="名称" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="code" label="编码" align="center" width="160" :show-overflow-tooltip="true" />
      <el-table-column prop="subject" label="邮件主题" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="enabled" label="启用" align="center" width="80">
        <template #default="{ row }">
          <el-tag :type="row.enabled === false ? 'info' : 'success'" size="small">
            {{ row.enabled === false ? '停用' : '启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="模板内容" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('content')" />
      <el-table-column prop="createBy" label="创建人" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('createBy')" />
      <el-table-column prop="createTime" label="创建时间" :show-overflow-tooltip="true" v-if="columns.showColumn('createTime')" />
      <el-table-column prop="updateBy" label="更新人" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('updateBy')" />
      <el-table-column prop="updateTime" label="更新时间" :show-overflow-tooltip="true" v-if="columns.showColumn('updateTime')" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button icon="view" size="small" type="primary" @click="handleOpenPre(scope.row)"></el-button>
          <el-button
            type="success"
            size="small"
            icon="edit"
            title="编辑"
            v-hasPermi="['tool:emailtpl:edit']"
            @click="handleUpdate(scope.row)"></el-button>
          <el-button
            type="danger"
            size="small"
            icon="delete"
            title="删除"
            v-hasPermi="['tool:emailtpl:delete']"
            @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改邮件模板对话框 -->
    <zr-dialog :title="title" :lock-scroll="false" v-model="open">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :lg="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="模板编码" prop="code">
              <el-input v-model="form.code" placeholder="业务编码，如 workflow.notify" />
            </el-form-item>
          </el-col>

          <el-col :lg="18">
            <el-form-item label="邮件主题" prop="subject">
              <el-input v-model="form.subject" :placeholder="'支持 {{key}} 占位符，如：【待办】{{subject}}'" />
            </el-form-item>
          </el-col>
          <el-col :lg="6">
            <el-form-item label="启用">
              <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="正文格式">
              <el-radio-group v-model="form.isHtml">
                <el-radio :value="true">HTML</el-radio>
                <el-radio :value="false">纯文本</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="模板内容" prop="content">
              <editor v-model="form.content" v-if="open" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-alert
              type="info"
              :closable="false"
              title="占位符说明"
              :description="'正文与主题均可使用 {{key}} 占位符，发送时按业务数据替换。内置编码：workflow.notify（工作流待办）、security.alert（安全提醒），未配置时使用内置默认模板。'" />
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </zr-dialog>

    <zr-dialog title="预览" draggable v-model="openPreview" width="580px">
      <template v-if="info">
        <div style="text-align: center" class="mb10">{{ info.subject || info.name }}</div>
        <!-- 模板内容可能是管理员输入的 HTML，用 sandbox iframe 渲染，避免脚本在后台执行 -->
        <iframe class="email-preview-frame" :srcdoc="info.content || ''" sandbox referrerpolicy="no-referrer"></iframe>
      </template>
      <template #footer>
        <el-button type="primary" @click="openPreview = false">{{ $t('btn.submit') }}</el-button>
      </template>
    </zr-dialog>
  </div>
</template>

<script setup name="emailtpl">
import { listEmailTpl, addEmailTpl, delEmailTpl, updateEmailTpl, getEmailTpl } from '@/api/system/emailtpl.js'
import Editor from '@/components/Editor'

const { proxy } = getCurrentInstance()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'Id',
  sortType: 'desc',
  name: undefined,
  code: undefined
})
const columns = ref([
  { visible: true, prop: 'content', label: '模板内容' },
  { visible: true, prop: 'createBy', label: '创建人' },
  { visible: true, prop: 'createTime', label: '创建时间' },
  { visible: false, prop: 'updateBy', label: '更新人' },
  { visible: false, prop: 'updateTime', label: '更新时间' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()

function getList() {
  loading.value = true
  listEmailTpl(queryParams).then((res) => {
    const { code, data } = res
    if (code == 200) {
      dataList.value = data.result
      total.value = data.totalNum
      loading.value = false
    }
  })
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
// 自定义排序
function sortChange(column) {
  var sort = undefined
  var sortType = undefined

  if (column.prop != null && column.order != null) {
    sort = column.prop
    sortType = column.order
  }
  queryParams.sort = sort
  queryParams.sortType = sortType
  handleQuery()
}

/*************** form操作 ***************/
const formRef = ref()
const title = ref('')
// 操作类型 1、add 2、edit 3、view
const opertype = ref(0)
const open = ref(false)
const state = reactive({
  single: true,
  multiple: true,
  form: {},
  rules: {
    name: [{ required: true, message: 'Name不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '模板内容不能为空', trigger: 'blur' }]
  },
  options: {}
})

const { form, rules } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    id: null,
    name: null,
    code: null,
    subject: null,
    content: null,
    isHtml: true,
    enabled: true,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  proxy.resetForm('formRef')
}
// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加邮件模板'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getEmailTpl(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改邮件模板'
      opertype.value = 2

      form.value = {
        ...data
      }
    }
  })
}

// 添加&修改 表单提交
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined && opertype.value === 2) {
        updateEmailTpl(form.value).then((res) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addEmailTpl(form.value).then((res) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

// 删除按钮操作
function handleDelete(row) {
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？')
    .then(function () {
      return delEmailTpl(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

const openPreview = ref(false)
const info = ref(undefined)
const handleOpenPre = function (row) {
  openPreview.value = true
  info.value = { ...row }
}
handleQuery()
</script>

<style scoped>
.email-preview-frame {
  width: 100%;
  height: 360px;
  border: 0;
}
</style>
