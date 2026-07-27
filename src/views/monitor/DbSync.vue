<!--
 * @Descripttion: (数据库结构同步/DbSync)
 * @Author: (zz)
 * @Date: (2026-07-26)
-->
<template>
  <div class="app-container">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="数据库结构同步"
      description="预览实体模型与数据库的实际结构差异，并一键补齐缺失的表与列（主库 + 商城库）。仅 ADD 缺失对象，不删列、不改列类型，安全幂等。可同时刷新种子数据（商城菜单等）。" />

    <el-row :gutter="10" class="mb8 mt10">
      <el-col :span="1.5">
        <el-button type="primary" icon="Refresh" :loading="loading" @click="handleDiff">刷新预览</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="Upload" :loading="syncing" :disabled="!hasAnyChange" @click="handleSync">一键同步</el-button>
      </el-col>
      <el-col :span="8">
        <el-tag v-if="!loading && !hasAnyChange" type="success" effect="plain">结构已一致，无需变更</el-tag>
        <el-tag v-else-if="hasAnyChange" type="warning" effect="plain">
          待同步：主库 {{ mainDb.changeCount }} 项 / 商城库 {{ mallDb.changeCount }} 项
        </el-tag>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :md="12" :sm="24">
        <el-card shadow="never" header="主库 (MainDb)">
          <el-empty v-if="!mainDb.hasChanges" description="无缺失表/列" />
          <div v-else>
            <div v-if="mainDb.newTables.length">
              <div class="db-section-title"><el-tag size="small" type="success">新增表 {{ mainDb.newTables.length }}</el-tag></div>
              <el-tag v-for="t in mainDb.newTables" :key="t" class="db-tag" effect="plain">+ {{ t }}</el-tag>
            </div>
            <div v-if="mainDb.newColumns.length" class="mt10">
              <div class="db-section-title"><el-tag size="small" type="warning">新增列 {{ mainDb.columnTotal }}</el-tag></div>
              <div v-for="tc in mainDb.newColumns" :key="tc.tableName" class="db-col-block">
                <div class="db-col-table">{{ tc.tableName }}</div>
                <el-tag v-for="c in tc.columns" :key="tc.tableName + c" class="db-tag" type="info" effect="plain">+ {{ c }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :md="12" :sm="24">
        <el-card shadow="never" header="商城库 (MallDb)">
          <el-empty v-if="!mallDb.hasChanges" description="无缺失表/列" />
          <div v-else>
            <div v-if="mallDb.newTables.length">
              <div class="db-section-title"><el-tag size="small" type="success">新增表 {{ mallDb.newTables.length }}</el-tag></div>
              <el-tag v-for="t in mallDb.newTables" :key="t" class="db-tag" effect="plain">+ {{ t }}</el-tag>
            </div>
            <div v-if="mallDb.newColumns.length" class="mt10">
              <div class="db-section-title"><el-tag size="small" type="warning">新增列 {{ mallDb.columnTotal }}</el-tag></div>
              <div v-for="tc in mallDb.newColumns" :key="tc.tableName" class="db-col-block">
                <div class="db-col-table">{{ tc.tableName }}</div>
                <el-tag v-for="c in tc.columns" :key="tc.tableName + c" class="db-tag" type="info" effect="plain">+ {{ c }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 同步结果日志 -->
    <zr-dialog title="同步结果" v-model="logOpen" width="680px" @close="logOpen = false">
      <el-scrollbar height="420px">
        <pre class="sync-log">{{ syncLogs.join('\n') || '无输出' }}</pre>
      </el-scrollbar>
      <template #footer>
        <el-button type="primary" @click="logOpen = false">关闭</el-button>
      </template>
    </zr-dialog>
  </div>
</template>

<script setup name="dbsync">
import { diffDbSync, diffMallDbSync, syncDbSync, syncMallDbSync } from '@/api/monitor/dbsync.js'

const { proxy } = getCurrentInstance()
const loading = ref(false)
const syncing = ref(false)
const hasAnyChange = ref(false)
const logOpen = ref(false)
const syncLogs = ref([])

const emptyDb = () => ({
  newTables: [],
  newColumns: [],
  hasChanges: false,
  columnTotal: 0,
  changeCount: 0
})

const mainDb = ref(emptyDb())
const mallDb = ref(emptyDb())

function normalize(db) {
  const newTables = db?.newTables || []
  const newColumns = (db?.newColumns || []).map((c) => ({
    tableName: c.tableName,
    columns: c.columns || []
  }))
  const columnTotal = newColumns.reduce((s, c) => s + c.columns.length, 0)
  return {
    newTables,
    newColumns,
    hasChanges: db?.hasChanges ?? (newTables.length > 0 || columnTotal > 0),
    columnTotal,
    changeCount: newTables.length + columnTotal
  }
}

function handleDiff() {
  loading.value = true
  Promise.all([diffDbSync(), diffMallDbSync()])
    .then(([mainRes, mallRes]) => {
      const main = mainRes.code === 200 ? mainRes.data : null
      const mall = mallRes.code === 200 ? mallRes.data : null
      if (main?.mainDb) mainDb.value = normalize(main.mainDb)
      if (mall?.mallDb) mallDb.value = normalize(mall.mallDb)
      hasAnyChange.value = mainDb.value.hasChanges || mallDb.value.hasChanges
    })
    .finally(() => {
      loading.value = false
    })
}

function handleSync() {
  proxy
    .$confirm('确认同步数据库结构（补齐缺失表/列）并刷新种子数据？该操作仅新增对象，不会影响现有数据。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      syncing.value = true
      syncLogs.value = []
      return Promise.all([syncDbSync(), syncMallDbSync(true)])
    })
    .then(([mainRes, mallRes]) => {
      const { code, data } = mainRes
      if (code === 200) {
        syncLogs.value = [...(mainRes.data?.logs || []), ...(mallRes.data?.logs || [])]
        logOpen.value = true
        proxy.$modal.msgSuccess('同步完成')
        handleDiff()
      }
    })
    .finally(() => {
      syncing.value = false
    })
}

handleDiff()
</script>

<style lang="scss" scoped>
.db-section-title {
  margin-bottom: 8px;
}
.db-tag {
  margin: 0 6px 6px 0;
}
.db-col-block {
  margin-bottom: 10px;
  .db-col-table {
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
  }
}
.sync-log {
  margin: 0;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
.mt10 {
  margin-top: 10px;
}
</style>
