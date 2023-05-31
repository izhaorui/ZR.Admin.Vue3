<template>
  <div class="app-container">
    <el-row :gutter="24" class="mb10">
      <el-alert title="本项目文章管理只提供基础的后端文章管理模块，文章的浏览自行实现。文章浏览地址在'系统管理->参数配置'" type="success"
    /></el-row>
    <el-row :gutter="24">
      <!-- :model属性用于表单验证使用 比如下面的el-form-item 的 prop属性用于对表单值进行验证操作 -->
      <el-form :model="queryParams" label-position="left" inline ref="queryForm" label-width="100px" v-show="showSearch" @submit.prevent>
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="文章状态" prop="status">
          <el-select v-model="queryParams.status">
            <el-option v-for="item in statusOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="plus" v-hasPermi="['system:article:add']" @click="handleAdd">发布文章</el-button>
      </el-col>
      <right-toolbar :showSearch="showSearch"></right-toolbar>
    </el-row>

    <el-table :data="dataList" ref="table" border>
      <el-table-column prop="cid" label="id" width="60" sortable> </el-table-column>
      <el-table-column prop="title" label="文章标题" width="120" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column prop="articleCategoryNav.name" label="文章目录"> </el-table-column>
      <el-table-column prop="coverUrl" label="文章封面" width="90" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <el-image
            preview-teleported
            :src="row.coverUrl"
            :preview-src-list="[row.coverUrl]"
            :hide-on-click-modal="true"
            fit="contain"
            lazy
            class="el-avatar">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="80"> </el-table-column>
      <el-table-column prop="fmt_type" label="编辑器类型" width="100"> </el-table-column>
      <el-table-column prop="tags" label="标签" width="100" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column prop="hits" label="点击量" width="80" align="center"> </el-table-column>
      <!-- <el-table-column prop="content" label="文章内容" :show-overflow-tooltip="true"> </el-table-column> -->
      <el-table-column sortable prop="status" align="center" label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status == '2' ? 'danger' : 'success'" disable-transitions
            >{{ scope.row.status == '2' ? '草稿' : '已发布' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否公开" align="center" prop="isPublic" width="100">
        <template #default="scope">
          <dict-tag :options="options.isPublicOptions" :value="scope.row.isPublic" />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="128" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template #default="scope">
          <el-button text size="small" icon="view" @click="handleView(scope.row)">查看</el-button>
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
  </div>
</template>
<script setup name="articleindex">
import { listArticle, delArticle } from '@/api/article/article.js'
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

const data = reactive({
  form: {},
  queryParams: {},
  options: {
    isPublicOptions: [
      { dictLabel: '是', dictValue: '1' },
      { dictLabel: '否', dictValue: '0', listClass: 'info' }
    ]
  }
})

const { queryParams, options } = toRefs(data)

proxy.getDicts('sys_article_status').then((response) => {
  statusOptions.value = response.data
})

proxy.getConfigKey('sys.article.preview.url').then((response) => {
  previewUrl.value = response.data
})
// 查询数据
function getList() {
  listArticle(queryParams.value).then((res) => {
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
function handleView(row) {
  var link = `${previewUrl.value}${row.cid}`
  window.open(link)
}

handleQuery()
</script>
