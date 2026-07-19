<template>
  <div class="app-container">
    <!-- 统计概览卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" body-style="display:flex;align-items:center;gap:14px;">
          <div class="stat-icon" style="background: #ecf5ff; color: #409eff">
            <el-icon><List /></el-icon>
          </div>
          <div>
            <div class="stat-num">{{ stats.total }}</div>
            <div class="stat-label">总日程</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" body-style="display:flex;align-items:center;gap:14px;">
          <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c">
            <el-icon><Loading /></el-icon>
          </div>
          <div>
            <div class="stat-num" style="color: #e6a23c">{{ stats.undone }}</div>
            <div class="stat-label">未完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" body-style="display:flex;align-items:center;gap:14px;">
          <div class="stat-icon" style="background: #f0f9eb; color: #67c23a">
            <el-icon><Calendar /></el-icon>
          </div>
          <div>
            <div class="stat-num" style="color: #67c23a">{{ stats.dueToday }}</div>
            <div class="stat-label">今日到期</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" body-style="display:flex;align-items:center;gap:14px;">
          <div class="stat-icon" style="background: #fef0f0; color: #f56c6c">
            <el-icon><Warning /></el-icon>
          </div>
          <div>
            <div class="stat-num" style="color: #f56c6c">{{ stats.overdue }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选栏 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" class="mt10">
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="未完成" value="0" />
          <el-option label="已完成" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="queryParams.priority" placeholder="全部" clearable style="width: 120px">
          <el-option label="低" :value="1" />
          <el-option label="中" :value="2" />
          <el-option label="高" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词" prop="keyWord">
        <el-input v-model="queryParams.keyWord" placeholder="标题/内容" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="截止时间" prop="dateRange">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          :shortcuts="dateShortcuts" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['dailyschedule:add']">新增日程</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 日程列表 -->
    <el-table v-loading="loading" :data="scheduleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="标题" prop="title" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span :class="{ 'done-title': row.status === '1' }">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" width="90">
        <template #default="scope">
          <el-tag :type="priorityMeta[scope.row.priority]?.type" effect="light">{{ priorityMeta[scope.row.priority]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="截止时间" align="center" prop="dueTime" width="160">
        <template #default="scope">
          <span :class="{ overdue: isOverdue(scope.row) }">{{ scope.row.dueTime || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提醒时间" align="center" prop="reminderTime" width="160">
        <template #default="scope">
          <span>{{ scope.row.reminderTime || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'info'" effect="plain">
            {{ scope.row.status === '1' ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template #default="scope">
          <el-button
            text
            :type="scope.row.status === '1' ? 'warning' : 'success'"
            :icon="scope.row.status === '1' ? 'RefreshLeft' : 'CircleCheck'"
            @click="handleToggle(scope.row)"
            v-hasPermi="['dailyschedule:edit']">
            {{ scope.row.status === '1' ? '取消完成' : '标记完成' }}
          </el-button>
          <el-button text icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dailyschedule:edit']">编辑</el-button>
          <el-button text icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dailyschedule:remove']">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有日程，点击「新增日程」开始记录吧" />
      </template>
    </el-table>

    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增/编辑弹框（复用 DailyScheduleForm 组件） -->
    <daily-schedule-form v-model="open" :schedule-id="currentId" @success="handleFormSuccess" />
  </div>
</template>

<script setup name="DailySchedule">
import { listDailySchedule, dailyScheduleStats, delDailySchedule, changeDailyScheduleStatus } from '@/api/system/dailyschedule'
import DailyScheduleForm from './DailyScheduleForm'
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const priorityMeta = {
  1: { label: '低', type: 'info' },
  2: { label: '中', type: 'warning' },
  3: { label: '高', type: 'danger' }
}

const dateShortcuts = [
  { text: '今天', value: () => [new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(23, 59, 59, 999))] },
  {
    text: '本周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return [start, end]
    }
  }
]

const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const scheduleList = ref([])
const stats = reactive({ total: 0, undone: 0, dueToday: 0, overdue: 0 })
const dateRange = ref([])
const open = ref(false)
const currentId = ref(undefined)

const data = reactive({
  queryParams: { pageNum: 1, pageSize: 10, status: '', priority: undefined, keyWord: '', beginTime: '', endTime: '' }
})
const { queryParams } = toRefs(data)

function isOverdue(row) {
  if (row.status === '1' || !row.dueTime) return false
  return new Date(row.dueTime).getTime() < Date.now()
}

function getList() {
  loading.value = true
  listDailySchedule(queryParams.value).then((res) => {
    scheduleList.value = res.data.result
    total.value = res.data.totalNum
    loading.value = false
  })
}

function getStats() {
  dailyScheduleStats().then((res) => {
    Object.assign(stats, res.data)
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.value.beginTime = dateRange.value[0]
    queryParams.value.endTime = dateRange.value[1]
  } else {
    queryParams.value.beginTime = ''
    queryParams.value.endTime = ''
  }
  getList()
}

function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  currentId.value = undefined
  open.value = true
}

function handleUpdate(row) {
  currentId.value = row.id || ids.value[0]
  open.value = true
}

function handleFormSuccess() {
  open.value = false
  getList()
  getStats()
}

function handleToggle(row) {
  const status = row.status === '1' ? '0' : '1'
  changeDailyScheduleStatus({ id: row.id, status }).then(() => {
    proxy.$modal.msgSuccess(status === '1' ? '已标记完成' : '已取消完成')
    getList()
    getStats()
  })
}

function handleDelete(row) {
  const scheduleIds = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除日程编号为"' + scheduleIds + '"的数据项？')
    .then(() => delDailySchedule(scheduleIds))
    .then(() => {
      getList()
      getStats()
      proxy.$modal.msgSuccess('删除成功')
    })
}

getList()
getStats()
</script>

<style scoped>
.stat-row {
  margin-bottom: 16px;
}
.stat-card {
  border: none;
}
.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.stat-num {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}
.done-title {
  text-decoration: line-through;
  color: #c0c4cc;
}
.overdue {
  color: #f56c6c;
  font-weight: 500;
}
</style>
