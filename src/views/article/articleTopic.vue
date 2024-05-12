<!--
 * @Descripttion: (话题/article_topic)
 * @Author: (admin)
 * @Date: (2024-05-12)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="话题名" prop="topicName">
        <el-input v-model="queryParams.topicName" placeholder="请输入话题名" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRangeAddTime"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="defaultTime"
          :shortcuts="dateOptions">
        </el-date-picker>
      </el-form-item>
      <!-- <el-form-item label="话题分类" prop="topicType">
        <el-select clearable v-model="queryParams.topicType" placeholder="请选择话题分类">
          <el-option v-for="item in options.topicTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
            <span class="fl">{{ item.dictLabel }}</span>
            <span class="fr" style="color: var(--el-text-color-secondary)">{{ item.dictValue }}</span>
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['articletopic:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['articletopic:export']">
          {{ $t('btn.export') }}
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
      <el-table-column prop="topicId" label="话题ID" align="center" v-if="columns.showColumn('topicId')" />
      <el-table-column prop="topicName" label="话题名" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('topicName')" />
      <el-table-column
        prop="topicDescription"
        label="话题描述"
        align="center"
        :show-overflow-tooltip="true"
        v-if="columns.showColumn('topicDescription')" />
      <el-table-column prop="joinNum" label="参与/发起次数" align="center" v-if="columns.showColumn('joinNum')" />
      <el-table-column prop="viewNum" label="浏览次数" align="center" v-if="columns.showColumn('viewNum')" />
      <el-table-column prop="addTime" label="创建时间" :show-overflow-tooltip="true" v-if="columns.showColumn('addTime')" />
      <!-- <el-table-column prop="topicType" label="话题分类" align="center" v-if="columns.showColumn('topicType')">
        <template #default="scope">
          <dict-tag :options="options.topicTypeOptions" :value="scope.row.topicType" />
        </template>
      </el-table-column> -->
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button-group>
            <el-button text v-hasPermi="['articletopic:edit']" type="success" icon="edit" title="编辑" @click="handleUpdate(scope.row)">
              编辑
            </el-button>
            <el-button text v-hasPermi="['articletopic:delete']" type="danger" icon="delete" title="删除" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :lock-scroll="false" v-model="open">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :lg="12">
            <el-form-item label="话题名" prop="topicName">
              <el-input v-model="form.topicName" :disabled="opertype == 2" placeholder="请输入话题名" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="话题描述" prop="topicDescription">
              <el-input type="textarea" v-model="form.topicDescription" placeholder="请输入话题描述" />
            </el-form-item>
          </el-col>

          <!-- <el-col :lg="12">
            <el-form-item label="话题分类" prop="topicType">
              <el-select v-model="form.topicType" placeholder="请选择话题分类">
                <el-option
                  v-for="item in options.topicTypeOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="parseInt(item.dictValue)"></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
        </el-row>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="articletopic">
import { listArticleTopic, addArticleTopic, delArticleTopic, updateArticleTopic, getArticleTopic } from '@/api/article/articletopic.js'
const { proxy } = getCurrentInstance()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: '',
  sortType: 'desc',
  topicName: undefined,
  addTime: undefined,
  topicType: undefined
})
const columns = ref([
  { visible: true, prop: 'topicId', label: '话题ID' },
  { visible: true, prop: 'topicName', label: '话题名' },
  { visible: true, prop: 'topicDescription', label: '话题描述' },
  { visible: true, prop: 'joinNum', label: '参与/发起次数' },
  { visible: true, prop: 'viewNum', label: '浏览次数' },
  { visible: true, prop: 'addTime', label: '创建时间' },
  { visible: true, prop: 'topicType', label: '话题分类' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

// 创建时间时间范围
const dateRangeAddTime = ref([])

var dictParams = []

function getList() {
  proxy.addDateRange(queryParams, dateRangeAddTime.value, 'AddTime')
  loading.value = true
  listArticleTopic(queryParams).then((res) => {
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
  // 创建时间时间范围
  dateRangeAddTime.value = []
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
    topicName: [{ required: true, message: '话题名不能为空', trigger: 'blur' }]
  },
  options: {
    // 话题分类 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    topicTypeOptions: []
  }
})

const { form, rules, options, single, multiple } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    topicId: null,
    topicName: null,
    topicDescription: null,
    joinNum: null,
    viewNum: null,
    addTime: null,
    topicType: null
  }
  proxy.resetForm('formRef')
}

// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加话题'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.topicId || ids.value
  getArticleTopic(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改话题'
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
      if (form.value.topicId != undefined && opertype.value === 2) {
        updateArticleTopic(form.value).then((res) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addArticleTopic(form.value).then((res) => {
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
  const Ids = row.topicId || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(function () {
      return delArticleTopic(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出话题数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await proxy.downFile('/content/ArticleTopic/export', { ...queryParams })
    })
}

handleQuery()
</script>
