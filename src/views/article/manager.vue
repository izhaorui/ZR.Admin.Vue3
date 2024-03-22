<template>
  <div class="app-container">
    <el-form :model="queryParams" label-position="left" inline ref="queryForm" v-show="showSearch" @submit.prevent>
      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="摘要" prop="abstractText">
        <el-input v-model="queryParams.abstractText" placeholder="请输入摘要" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-cascader
          class="w100"
          :options="categoryOptions"
          :props="{ checkStrictly: true, value: 'categoryId', label: 'name', emitPath: false }"
          placeholder="请选择分类"
          clearable
          v-model="queryParams.categoryId" />
      </el-form-item>

      <el-form-item prop="status">
        <el-radio-group v-model="queryParams.status" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in statusOptions" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否公开" prop="isPublic">
        <el-radio-group v-model="queryParams.isPublic" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in options.isPublicOptions" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否置顶" prop="isTop">
        <el-radio-group v-model="queryParams.isTop" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in options.isPublicOptions" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="plus" v-hasPermi="['system:article:add']" @click="handleAdd">发布文章</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch"></right-toolbar>
    </el-row>

    <el-table :data="dataList" v-loading="loading" highlight-current-row @sort-change="sortChange" ref="table">
      <el-table-column prop="cid" label="id" width="60" sortable> </el-table-column>
      <el-table-column prop="title" label="标题" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-button link type="primary" @click="handleView(scope.row)">{{ scope.row.title }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="articleCategoryNav.name" label="分类"> </el-table-column>
      <el-table-column prop="coverUrl" label="封面" width="90" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <image-preview :src="row.coverUrl"></image-preview>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="80"> </el-table-column>
      <!-- <el-table-column prop="fmt_type" label="编辑器类型" width="100"> </el-table-column> -->
      <el-table-column prop="tags" label="标签" width="100" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column prop="hits" label="点击量" width="80" align="center"> </el-table-column>
      <el-table-column prop="abstractText" label="摘要" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column sortable prop="status" align="center" label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status == '2' ? 'danger' : 'success'">{{ scope.row.status == '2' ? '草稿' : '已发布' }} </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="置顶" prop="isTop" width="70" align="center" sortable>
        <template #default="scope">
          <el-switch
            v-model="scope.row.isTop"
            inline-prompt
            active-text="是"
            inactive-text="否"
            :active-value="1"
            :inactive-value="0"
            @change="handleTopChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="公开" align="center" prop="isPublic" sortable width="70">
        <template #default="scope">
          <el-switch
            v-model="scope.row.isPublic"
            inline-prompt
            active-text="是"
            inactive-text="否"
            :active-value="1"
            :inactive-value="0"
            @change="handleChangePublic(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="128" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column label="操作" align="center" width="130" fixed="right">
        <template #default="scope">
          <el-button text size="small" icon="edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:article:update']">编辑</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row)" style="margin-left: 10px">
            <template #reference>
              <el-button text size="small" icon="delete" v-hasPermi="['system:article:delete']">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="previewInfo.title" v-model="showPreview">
      <MdPreview show-code-row-number editorId="id1" :modelValue="previewInfo.content" />
    </el-dialog>
  </div>
</template>
<script setup name="index">
import { listArticle, delArticle, topArticle, changeArticlePublic, getArticle } from '@/api/article/article.js'
import { treelistArticleCategory } from '@/api/article/articlecategory.js'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
const { proxy } = getCurrentInstance()
const router = useRouter()
// 显示搜索条件
const showSearch = ref(true)
// 文章状态下拉框
const statusOptions = ref([])
// 数据列表
const dataList = ref([])
// 总记录数
const total = ref(0)
// 文章预览地址
const previewUrl = ref('')
// 文章目录下拉框
const categoryOptions = ref([])
const loading = ref(false)
const data = reactive({
  form: {},
  queryParams: {
    sort: 'cid',
    sortType: 'desc',
    status: '',
    isPublic: '',
    isTop: ''
  },
  options: {
    isPublicOptions: [
      { dictLabel: '是', dictValue: '1' },
      { dictLabel: '否', dictValue: '0', listClass: 'info' }
    ]
  }
})
const queryForm = ref()
const { queryParams, options } = toRefs(data)

// 自定义排序
function sortChange(column) {
  if (column.prop == null || column.order == null) {
    queryParams.sort = undefined
    queryParams.sortType = undefined
  } else {
    queryParams.sort = column.prop
    queryParams.sortType = column.order
  }

  handleQuery()
}

proxy.getDicts('sys_article_status').then((response) => {
  statusOptions.value = response.data
})

proxy.getConfigKey('sys.article.preview.url').then((response) => {
  previewUrl.value = response.data
})

/** 查询菜单下拉树结构 */
function getCategoryTreeselect() {
  treelistArticleCategory().then((res) => {
    if (res.code == 200) {
      categoryOptions.value = res.data
    }
  })
}
// 查询数据
function getList() {
  loading.value = true
  listArticle(queryParams.value).then((res) => {
    loading.value = false
    if (res.code == 200) {
      dataList.value = res.data.result
      total.value = res.data.totalNum
    }
  })
}

/** 重置查询操作 */
function resetQuery() {
  proxy.resetForm('queryForm')
  handleQuery()
}
/** 搜索按钮操作 */
function handleQuery() {
  getList()
}

/** 新增按钮操作 */
function handleAdd() {
  router.replace({ path: '/article/publish' })
}

/** 删除按钮操作 */
function handleDelete(row) {
  delArticle(row.cid).then((res) => {
    if (res.code == 200) {
      proxy.$modal.msgSuccess('删除成功')
      handleQuery()
    }
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  router.push({ path: '/article/publish', query: { cid: row.cid } })
}
// 详情
const previewInfo = ref({})
function handleView(row) {
  // var link = `${previewUrl.value}${row.cid}`
  // window.open(link)
  getArticle(row.cid).then((res) => {
    previewInfo.value = res.data
    showPreview.value = true
  })
}
function handleTopChange(row) {
  topArticle({ cid: row.cid, isTop: row.isTop }).then((res) => {
    handleQuery()
  })
}
function handleChangePublic(row) {
  changeArticlePublic({ cid: row.cid, isPublic: row.isPublic }).then((res) => {
    handleQuery()
  })
}

const showPreview = ref(false)

getCategoryTreeselect()
handleQuery()
</script>
