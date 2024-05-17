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
      <el-form-item label="审核状态" prop="auditStatus">
        <el-radio-group v-model="queryParams.auditStatus" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in options.auditOptions" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="status">
        <el-radio-group v-model="queryParams.status" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in options.sys_article_status" :key="item.dictValue" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="articleType">
        <el-radio-group v-model="queryParams.articleType" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button v-for="item in options.sys_article_type" :key="item.dictValue" :value="item.dictValue">
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
        <el-button type="success" :disabled="multiple" v-hasPermi="['article:audit']" plain icon="check" size="small" @click="handleAuditPass">
          通过
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" v-hasPermi="['article:audit']" plain icon="close" size="small" @click="handleAuditReject">
          拒绝
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="plus" v-hasPermi="['system:article:add']" size="small" @click="handleAdd">发布文章</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="plus" v-hasPermi="['system:article:add']" size="small" @click="handleMonents">发布动态</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table
      :data="dataList"
      height="600px"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      highlight-current-row
      @sort-change="sortChange"
      ref="table">
      <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
      <el-table-column prop="cid" label="文章信息" width="130">
        <template #default="{ row }">
          <div @click="handleView(row)">内容id：{{ row.cid }}</div>
          <div>作者：{{ row.authorName }}</div>
          <div>标签：{{ row.tags }}</div>
        </template>
      </el-table-column>
      <el-table-column label="分类">
        <template #default="{ row }">
          <div v-if="row.articleCategoryNav">{{ row.articleCategoryNav.name }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-button link type="primary" @click="handleView(scope.row)">{{ scope.row.title }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="coverUrl" label="封面" width="90" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <image-preview :src="row.coverUrl" split="," style="width: 40px" v-if="row.coverUrl"></image-preview>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="authorName" label="作者" width="80"> </el-table-column> -->
      <!-- <el-table-column prop="fmt_type" label="编辑器类型" width="100"> </el-table-column> -->
      <!-- <el-table-column prop="tags" label="标签" width="100" :show-overflow-tooltip="true"> </el-table-column> -->
      <el-table-column prop="hits" label="浏览" width="80" align="center" sortable> </el-table-column>
      <el-table-column prop="praiseNum" label="赞" width="80" align="center" sortable> </el-table-column>
      <el-table-column prop="commentNum" label="评论" width="80" align="center" sortable> </el-table-column>
      <el-table-column prop="abstractText" label="摘要" v-if="columns.showColumn('abstractText')"> </el-table-column>
      <el-table-column prop="status" align="center" label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status == '2' ? 'danger' : 'success'">{{ scope.row.status == '2' ? '草稿' : '已发布' }} </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="auditStatus" align="center" label="审核" width="90">
        <template #default="scope">
          <dict-tag :options="options.auditOptions" :value="scope.row.auditStatus"> </dict-tag>
        </template>
      </el-table-column>
      <el-table-column label="置顶" prop="isTop" width="90" align="center" v-if="columns.showColumn('isTop')" sortable>
        <template #default="scope">
          <el-switch
            v-model="scope.row.isTop"
            inline-prompt
            disabled
            active-text="是"
            inactive-text="否"
            :active-value="1"
            :inactive-value="0"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="公开" align="center" prop="isPublic" width="90">
        <template #default="scope">
          <el-switch
            v-model="scope.row.isPublic"
            inline-prompt
            active-text="是"
            inactive-text="否"
            :active-value="1"
            :inactive-value="0"
            disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="128" :show-overflow-tooltip="true">
        <template #default="scope">
          {{ showTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="scope">
          <el-button-group>
            <el-button size="small" icon="view" @click="handleView(scope.row)"> </el-button>
            <el-button
              size="small"
              icon="edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:article:update']"
              v-if="scope.row.articleType == 0">
            </el-button>
            <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row)" style="margin-left: 10px">
              <template #reference>
                <el-button size="small" type="danger" icon="delete" v-hasPermi="['system:article:delete']"></el-button>
              </template>
            </el-popconfirm>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="previewInfo.title" v-model="showPreview">
      <image-preview :src="previewInfo.coverUrl" split="," style="height: 140px" v-if="previewInfo.coverUrl"></image-preview>
      <MdPreview show-code-row-number editorId="id1" :theme="settingsStore.codeMode" :modelValue="previewInfo.content" />
    </el-dialog>
  </div>
</template>
<script setup name="index">
import { listArticle, delArticle, auditArticle, getArticle } from '@/api/article/article.js'
import { treelistArticleCategory } from '@/api/article/articlecategory.js'
import { MdPreview } from 'md-editor-v3'
import { showTime } from '@/utils/index'
import 'md-editor-v3/lib/preview.css'
import useSettingsStore from '@/store/modules/settings'
const settingsStore = useSettingsStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
// 选中mid数组数组
const ids = ref([])
// 非单选禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 数据列表
const dataList = ref([])
// 总记录数
const total = ref(0)

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
    isTop: '',
    articleType: '',
    auditStatus: ''
  },
  options: {
    isPublicOptions: [
      { dictLabel: '是', dictValue: '1' },
      { dictLabel: '否', dictValue: '0', listClass: 'info' }
    ],
    auditOptions: [
      { dictLabel: '通过', dictValue: '1' },
      { dictLabel: '待审核', dictValue: '0', listClass: 'info' },
      { dictLabel: '不通过', dictValue: '2', listClass: 'danger' }
    ],
    // 评论权限
    sys_comment_permi: [],
    //文章状态
    sys_article_status: [],
    // 文章类型
    sys_article_type: []
  }
})
const columns = ref([
  { visible: false, prop: 'abstractText', label: '摘要' },
  { visible: false, prop: 'isTop', label: '置顶' }
])
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

proxy.getDicts(['sys_article_status', 'sys_article_type', 'sys_comment_permi']).then((response) => {
  response.data.forEach((element) => {
    data.options[element.dictType] = element.list
  })
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
  router.push({ path: '/article/publish' })
}

function handleMonents() {
  router.push({ path: '/article/publishMoments' })
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
  getArticle(row.cid).then((res) => {
    previewInfo.value = res.data
    showPreview.value = true
  })
}
// function handleTopChange(row) {
//   topArticle({ cid: row.cid, isTop: row.isTop }).then((res) => {
//     handleQuery()
//   })
// }
// function handleChangePublic(row) {
//   changeArticlePublic({ cid: row.cid, isPublic: row.isPublic }).then((res) => {
//     handleQuery()
//   })
// }
function checkSelectable(row) {
  return row.auditStatus == 0 ? true : false
}
/**
 * 审核通过
 * @param {审核} row
 */
function handleAuditPass(row) {
  const id = row.cid || ids.value
  auditArticle('pass', id).then((res) => {
    const { code } = res
    if (code == 200) {
      proxy.$modal.msgSuccess('通过成功')
    }
    getList()
  })
}

/**
 * 拒绝
 * @param {*} row
 */
function handleAuditReject(row) {
  const id = row.cid || ids.value

  proxy.$prompt('请输入拒绝原因', 'Tip', {}).then(({ value }) => {
    auditArticle('reject', id, { reason: value }).then((res) => {
      const { code } = res
      if (code == 200) {
        proxy.$modal.msgSuccess('拒绝成功')
      }
      getList()
    })
  })
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.cid)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

const showPreview = ref(false)

getCategoryTreeselect()
handleQuery()
</script>
