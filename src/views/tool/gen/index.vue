<template>
  <div class="app-container">
    <el-form ref="codeform" :inline="true" :model="queryParams">
      <el-form-item label="表名" prop="tableName">
        <el-input v-model="queryParams.tableName" style="width: 200px" clearable placeholder="输入要查询的表名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="getList()">查询</el-button>
        <el-button icon="refresh" @click="handleReset()">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb10">
      <el-col :span="1.5">
        <el-button type="info" plain icon="upload" @click="openImportTable" v-hasPermi="['tool:gen:import']">导入数据表</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" plain icon="delete" @click="handleDelete" v-hasPermi="['tool:gen:remove']"> 删除</el-button>
      </el-col>
    </el-row>
    <el-table
      ref="gridtable"
      v-loading="tableloading"
      :data="tableList"
      border
      @selection-change="handleSelectionChange"
      highlight-current-row
      height="400px">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column prop="tableId" label="tableId" width="80" sortable="" />
      <el-table-column prop="dbName" label="数据库名" width="90" :show-overflow-tooltip="true" />
      <el-table-column prop="tplCategory" label="生成模板" width="90" sortable="" />
      <el-table-column prop="tableName" label="表名" width="120" :show-overflow-tooltip="true" />
      <el-table-column prop="tableComment" label="表描述" :show-overflow-tooltip="true" width="120" />
      <el-table-column prop="className" label="实体" :show-overflow-tooltip="true" />
      <el-table-column prop="createTime" label="创建时间" sortable />
      <el-table-column prop="updateTime" label="更新时间" sortable />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button-group>
            <el-button text icon="view" @click="handlePreview(scope.row)" v-hasPermi="['tool:gen:preview']"> 预览 </el-button>
            <el-button text icon="edit" @click="handleEditTable(scope.row)" v-hasPermi="['tool:gen:edit']"> 编辑 </el-button>

            <el-dropdown @command="handleCommand($event, scope.row)">
              <el-button text>
                {{ $t('btn.more') }}
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </el-button>

              <template #dropdown>
                <el-dropdown-menu>
                  <div v-hasPermi="['tool:gen:code']">
                    <el-dropdown-item command="generate">
                      <el-button icon="download" link>生成代码</el-button>
                    </el-dropdown-item>
                  </div>
                  <div v-hasPermi="['tool:gen:edit']">
                    <el-dropdown-item command="sync">
                      <el-button icon="refresh" link> 同步 </el-button>
                    </el-dropdown-item>
                  </div>
                  <div v-hasPermi="['tool:gen:remove']">
                    <el-dropdown-item command="delete">
                      <el-button icon="delete" type="danger" link> 删除 </el-button>
                    </el-dropdown-item>
                  </div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" v-model:total="total" @pagination="getList" />

    <!-- 预览界面 -->
    <zr-dialog v-model="preview.open" width="80%" top="5vh" append-to-body>
      <el-tabs v-model="preview.activeName">
        <el-tab-pane v-for="(item, key) in preview.data" :label="item.title" :id="key" :name="key.toString()" :key="key">
          {{ item.path }}
          <el-link :underline="false" icon="DocumentCopy" @click="onCopy(item.content)" class="btn-copy">复制 </el-link>
          <pre><code class="hljs" v-html="highlightedCode(item.content)"></code></pre>
        </el-tab-pane>
      </el-tabs>
    </zr-dialog>
    <import-table ref="importRef" @ok="getList" />
  </div>
</template>

<script setup name="gen">
import { codeGenerator, listTable, delTable, previewTable, synchDb } from '@/api/tool/gen'
import { useRouter } from 'vue-router'
import importTable from './importTable'
import hljs from 'highlight.js'
import 'highlight.js/styles/dark.css' // 这里有多个样式，自己可以根据需要切换
import { useClipboard } from '@vueuse/core'
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const tableList = ref([])
const tableloading = ref(true)
const tableIds = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const dateRange = ref([])
const showGenerate = ref(false)
// 选中行的表
const currentSelected = ref({})

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    t: 0
  },
  preview: {
    open: false,
    title: '代码预览',
    data: {},
    activeName: '0'
  }
})

const { queryParams, preview } = toRefs(data)
watch(
  route,
  (val) => {
    if (val) {
      getList()
    }
  },
  {
    immediate: true
  }
)
/** 查询表集合 */
function getList() {
  tableloading.value = true
  listTable(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    tableList.value = response.data.result
    total.value = response.data.totalNum
    tableloading.value = false
  })
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 生成代码操作 */
function handleGenTable(row) {
  currentSelected.value = row
  if (!currentSelected.value) {
    proxy.$modal.msgError('请先选择要生成代码的数据表')
    return false
  }
  proxy.$refs['codeform'].validate((valid) => {
    if (valid) {
      proxy.$modal.loading('正在生成代码...')

      codeGenerator({
        tableId: currentSelected.value.tableId,
        tableName: currentSelected.value.name,
        VueVersion: 3
      })
        .then(async (res) => {
          const { data } = res
          showGenerate.value = false
          if (row.genType === '1') {
            proxy.$modal.msgSuccess('成功生成到自定义路径')
          } else {
            proxy.$modal.msgSuccess('恭喜你，代码生成完成！')
            // proxy.download(data.path)
            await proxy.downFile('/common/downloadFile', { path: data.path })
          }
        })
        .finally(() => {
          proxy.$modal.closeLoading()
        })
    } else {
      return false
    }
  })
}
/** 同步数据库操作 */
function handleSynchDb(row) {
  const tableName = row.tableName
  proxy
    .$confirm('确认要强制同步"' + tableName + '"表结构吗？')
    .then(function () {
      return synchDb(row.tableId, { tableName, dbName: row.dbName })
    })
    .then(() => {
      proxy.$modal.msgSuccess('同步成功')
    })
    .catch(() => {})
}
/** 打开导入表弹窗 */
function openImportTable() {
  proxy.$refs['importRef'].show()
}
/** 预览按钮 */
function handlePreview(row) {
  proxy.$refs['codeform'].validate((valid) => {
    if (!valid) {
      proxy.$modal.msgError('请先完成表格内容')
      return
    }
    proxy.$modal.loading('请稍后...')
    previewTable(row.tableId, { VueVersion: 3 })
      .then((res) => {
        if (res.code === 200) {
          showGenerate.value = false
          preview.value.open = true
          preview.value.data = res.data
        }
      })
      .finally(() => {
        proxy.$modal.closeLoading()
      })
  })
}
// 多选框选中数据
function handleSelectionChange(selection) {
  tableIds.value = selection.map((item) => item.tableId)
  multiple.value = !selection.length
}
/** 编辑表格 */
function handleEditTable(row) {
  queryParams.value.tableName = row.tableName
  getList()

  router.push({
    path: '/gen/editTable',
    query: { tableId: row.tableId }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const Ids = row.tableId || tableIds.value
  proxy
    .$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      delTable(Ids.toString()).then((res) => {
        if (res.code == 200) {
          proxy.$modal.msgSuccess('删除成功')

          handleQuery()
        }
      })
    })
    .catch(() => {
      proxy.$message({
        type: 'info',
        message: '已取消删除'
      })
    })
}
/** 高亮显示 */
function highlightedCode(code) {
  const result = hljs.highlightAuto(code || '')
  return result.value || '&nbsp;'
}

const { copy, isSupported } = useClipboard()
function onCopy(input) {
  if (isSupported) {
    copy(input)
    proxy.$modal.msgSuccess('复制成功！')
  } else {
    proxy.$modal.msgError('当前浏览器不支持')
  }
}
function handleCommand(command, row) {
  switch (command) {
    case 'generate':
      handleGenTable(row)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'sync':
      handleSynchDb(row)
      break
  }
}
function handleReset() {
  proxy.resetForm('codeform')
  handleQuery()
}
getList()
</script>
<style>
.btn-copy {
  position: absolute;
  right: 0;
  top: -5px;
}
.el-dropdown {
  vertical-align: middle;
}
</style>
