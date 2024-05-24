<!--
 * @Descripttion: (广告管理/banner_config)
 * @Author: (admin)
 * @Date: (2024-05-11)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="是否显示" prop="showStatus">
        <el-radio-group v-model="queryParams.showStatus">
          <el-radio-button>全部</el-radio-button>
          <el-radio-button v-for="item in options.sys_show_hide" :key="item.dictValue" :value="item.dictValue">{{
            item.dictLabel
          }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="广告类型" prop="adType">
        <el-radio-group v-model="queryParams.adType" @change="handleQuery()">
          <el-radio-button>全部</el-radio-button>
          <el-radio-button v-for="item in options.sys_ad_type" :key="item.dictValue" :value="item.dictValue">{{ item.dictLabel }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['bannerconfig:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['bannerconfig:export']">
          {{ $t('btn.export') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <myTable
      row-key="id"
      v-loading="loading"
      :columns="columns"
      :data="dataList"
      :dicts="options"
      header-cell-class-name="el-table-header-cell"
      @sort-change="sortChange">
      <!-- <template #tableColumn>
        <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
      </template> -->
      <template #beginTime="{ row }">
        <div>{{ showTime(row.beginTime) }}</div>
        <div>{{ showTime(row.endTime) }}</div>
      </template>
      <template #sortId="{ scope }">
        <span v-show="editIndex != scope.$index" @click="editCurrRow(scope.$index)">{{ scope.row.sortId }}</span>
        <el-input :ref="setColumnsRef" v-show="editIndex == scope.$index" v-model="scope.row.sortId" @blur="handleChangeSort(scope.row)"></el-input>
      </template>
      <template #actions="{ scope }">
        <el-button
          type="success"
          size="small"
          icon="edit"
          title="编辑"
          v-hasPermi="['bannerconfig:edit']"
          @click="handleUpdate(scope.row)"></el-button>
        <el-button
          type="danger"
          size="small"
          icon="delete"
          title="删除"
          v-hasPermi="['bannerconfig:delete']"
          @click="handleDelete(scope.row)"></el-button>
      </template>
    </myTable>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="600">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :lg="24">
            <el-form-item label="类型" prop="adType">
              <el-radio-group v-model="form.adType">
                <el-radio v-for="item in options.sys_ad_type" :key="item.dictValue" :value="parseInt(item.dictValue)">
                  {{ item.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="说明" prop="content">
              <el-input v-model="form.content" placeholder="请输入说明" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="图片" prop="imgUrl">
              <UploadImage v-model="form.imgUrl" :limit="1" :data="{ uploadType: 1 }" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="跳转类型" prop="jumpType">
              <el-radio-group v-model="form.jumpType">
                <el-radio-button v-for="item in options.jumpTypeOptions" :key="item.dictValue" :value="parseInt(item.dictValue)">
                  {{ item.dictLabel }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :lg="24" v-if="form.jumpType != 0">
            <el-form-item label="链接" prop="link">
              <el-input v-model="form.link" placeholder="请输入链接" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="开始时间" prop="beginTime">
              <el-date-picker v-model="form.beginTime" type="datetime" placeholder="选择日期时间"> </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="排序id" prop="sortId">
              <el-input-number v-model.number="form.sortId" :min="0" :controls="true" controls-position="right" placeholder="请输入排序id" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="是否显示" prop="showStatus">
              <el-radio-group v-model="form.showStatus">
                <el-radio v-for="item in options.sys_show_hide" :key="item.dictValue" :value="parseInt(item.dictValue)">
                  {{ item.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="bannerconfig">
import { listBannerConfig, addBannerConfig, delBannerConfig, updateBannerConfig, getBannerConfig, changeSort } from '@/api/public/bannerconfig.js'
const { proxy } = getCurrentInstance()
import { showTime } from '@/utils'
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'id',
  sortType: 'desc',
  title: undefined,
  jumpType: undefined,
  showStatus: undefined,
  adType: undefined
})
const columns = ref([
  { visible: true, prop: 'id', label: 'id' },
  { visible: true, prop: 'title', label: '标题' },
  { visible: true, prop: 'content', label: '说明' },
  { visible: true, prop: 'link', label: '链接', showOverflowTooltip: true },
  { visible: true, prop: 'imgUrl', label: '图片', type: 'img' },
  { visible: true, prop: 'jumpType', label: '跳转类型', type: 'dict', dictType: 'jumpTypeOptions' },
  { visible: false, prop: 'addTime', label: '添加时间' },
  { visible: true, prop: 'clicksNumber', label: '点击次数' },
  { visible: true, prop: 'showStatus', label: '是否显示', type: 'dict', dictType: 'sys_show_hide' },
  { visible: true, prop: 'adType', label: '广告类型', type: 'dict', dictType: 'sys_ad_type' },
  { visible: true, prop: 'beginTime', label: '显示时间', type: 'slot', width: '130', align: 'left' },
  { visible: true, prop: 'sortId', label: '排序id', type: 'slot' },
  {
    visible: true,
    prop: 'actions',
    label: '操作',
    type: 'slot',
    width: '120'
  }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

/******************自定义编辑 start **********************/
const editIndex = ref(-1)
const columnRefs = ref([])
const setColumnsRef = (el) => {
  if (el) {
    columnRefs.value.push(el)
  }
}
// 显示编辑排序
function editCurrRow(index) {
  editIndex.value = index

  setTimeout(() => {
    columnRefs.value[index].focus()
  }, 100)
}
// 保存排序
function handleChangeSort(info) {
  editIndex.value = -1
  proxy
    .$confirm('是否保存数据?')
    .then(function () {
      return changeSort({ value: info.sortId, id: info.id })
    })
    .then(() => {
      handleQuery()
      proxy.$modal.msgSuccess('修改成功')
    })
}
/******************自定义编辑 end **********************/

var dictParams = ['sys_show_hide', 'sys_ad_type']

proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    state.options[element.dictType] = element.list
  })
})

function getList() {
  loading.value = true
  listBannerConfig(queryParams).then((res) => {
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
    title: [{ required: true, message: 'Title不能为空', trigger: 'blur' }],
    jumpType: [{ required: true, message: '跳转类型不能为空', trigger: 'change', type: 'number' }],
    showStatus: [{ required: true, message: '是否显示不能为空', trigger: 'blur', type: 'number' }],
    adType: [{ required: true, message: '广告类型不能为空', trigger: 'change', type: 'number' }],
    beginTime: [{ required: true, message: '广告显示时间不能为空', trigger: 'change' }],
    endTime: [{ required: true, message: '广告显示时间不能为空', trigger: 'change' }],
    link: [{ required: true, message: '跳转链接不能为空', trigger: 'blur' }]
  },
  options: {
    // 跳转类型 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    jumpTypeOptions: [
      { dictLabel: '不跳转', dictValue: '0' },
      { dictLabel: '外链', dictValue: '1' },
      { dictLabel: '内部跳转', dictValue: '2' }
    ],
    // 是否显示 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    sys_show_hide: [],
    // 广告类型
    sys_ad_type: []
  }
})

const { form, rules, options } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    id: null,
    title: null,
    content: null,
    link: null,
    imgUrl: null,
    jumpType: null,
    addTime: null,
    clicksNumber: null,
    showStatus: 1,
    adType: null,
    beginTime: null,
    endTime: null,
    sortId: 0
  }
  proxy.resetForm('formRef')
}

// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加广告管理'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getBannerConfig(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改广告管理'
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
        updateBannerConfig(form.value).then((res) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addBannerConfig(form.value).then((res) => {
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
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(function () {
      return delBannerConfig(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

// 导出按钮操作
function handleExport() {
  proxy
    .$confirm('是否确认导出广告管理数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      await proxy.downFile('/public/BannerConfig/export', { ...queryParams })
    })
}

handleQuery()
</script>
