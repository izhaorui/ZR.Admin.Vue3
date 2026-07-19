<template>
  <el-card shadow="hover" class="schedule-card">
    <template #header>
      <div class="schedule-card-header">
        <span class="schedule-card-title">
          <el-icon><List /></el-icon>
          我的日程
        </span>
        <div class="schedule-card-actions">
          <!-- <el-button type="primary" link :icon="Plus" @click="openForm" v-hasPermi="['dailyschedule:add']">添加</el-button> -->
          <router-link :to="schedulePath" class="schedule-card-more">全部 ›</router-link>
        </div>
      </div>
    </template>

    <!-- 快捷添加 -->
    <div class="schedule-quick-add">
      <el-input v-model="quickTitle" placeholder="快速添加一条日程，回车保存" maxlength="200" clearable @keyup.enter="handleQuickAdd">
        <template #prepend>
          <el-select v-model="quickPriority" style="width: 78px">
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Plus" :loading="adding" v-hasPermi="['dailyschedule:add']" @click="openForm">添加</el-button>
        </template>
      </el-input>
    </div>

    <!-- 统计 -->
    <div class="schedule-stat">
      <span
        >未完成 <b class="c-warning">{{ stats.undone }}</b></span
      >
      <el-divider direction="vertical" />
      <span
        >今日到期 <b class="c-success">{{ stats.dueToday }}</b></span
      >
      <el-divider direction="vertical" />
      <span
        >已逾期 <b class="c-danger">{{ stats.overdue }}</b></span
      >
    </div>

    <!-- 列表 -->
    <div v-loading="loading" class="schedule-list">
      <el-scrollbar max-height="300px">
        <div v-for="item in scheduleList" :key="item.id" class="schedule-item">
          <div class="schedule-item-main">
            <div class="schedule-item-title">
              <el-checkbox :model-value="item.status === '1'" @change="(val) => handleToggle(item, val)" v-hasPermi="['dailyschedule:edit']" />
              <span class="schedule-item-text">{{ item.title }}</span>
              <el-tag :type="priorityMeta[item.priority]?.type" effect="light" size="small" class="ml6">
                {{ priorityMeta[item.priority]?.label }}
              </el-tag>
            </div>
            <div class="schedule-item-time" :class="{ overdue: isOverdue(item) }">
              <template v-if="item.dueTime">
                <el-icon><AlarmClock /></el-icon>
                {{ item.dueTime }}
              </template>
            </div>
          </div>
        </div>

        <el-empty v-if="!loading && scheduleList.length === 0" description="还没有日程，赶紧添加一条吧" :image-size="70" />
      </el-scrollbar>
    </div>

    <!-- 新增/编辑弹框（复用 DailyScheduleForm 组件） -->
    <daily-schedule-form v-model="formOpen" @success="onFormSuccess" />
  </el-card>
</template>

<script setup name="DailyScheduleCard">
import { Plus, AlarmClock } from '@element-plus/icons-vue'
import { listDailySchedule, dailyScheduleStats, addDailySchedule, changeDailyScheduleStatus } from '@/api/system/dailyschedule'
import DailyScheduleForm from '@/views/system/dailyschedule/DailyScheduleForm'
import { getCurrentInstance, ref } from 'vue'

const { proxy } = getCurrentInstance()

// 日程页面真实路由地址（后端动态菜单配置为 /personal/dailyschedule）
const schedulePath = '/personal/dailyschedule'

const formOpen = ref(false)
function openForm() {
  formOpen.value = true
}
function onFormSuccess() {
  formOpen.value = false
  getList()
  getStats()
}

const priorityMeta = {
  1: { label: '低', type: 'info' },
  2: { label: '中', type: 'warning' },
  3: { label: '高', type: 'danger' }
}

const loading = ref(true)
const adding = ref(false)
const quickTitle = ref('')
const quickPriority = ref(2)
const scheduleList = ref([])
const stats = reactive({ total: 0, undone: 0, dueToday: 0, overdue: 0 })

function isOverdue(row) {
  if (row.status === '1' || !row.dueTime) return false
  return new Date(row.dueTime).getTime() < Date.now()
}

function getList() {
  loading.value = true
  listDailySchedule({ pageNum: 1, pageSize: 8, status: '0' }).then((res) => {
    scheduleList.value = res.data.result || []
    loading.value = false
  })
}

function getStats() {
  dailyScheduleStats().then((res) => {
    Object.assign(stats, res.data)
  })
}

function handleQuickAdd() {
  const title = quickTitle.value.trim()
  if (!title) {
    proxy.$modal.msgWarning('请输入日程内容')
    return
  }
  adding.value = true
  addDailySchedule({ title, priority: quickPriority.value })
    .then(() => {
      proxy.$modal.msgSuccess('添加成功')
      quickTitle.value = ''
      getList()
      getStats()
    })
    .finally(() => {
      adding.value = false
    })
}

function handleToggle(row, checked) {
  const status = checked ? '1' : '0'
  if (row.status === status) return
  changeDailyScheduleStatus({ id: row.id, status }).then(() => {
    getList()
    getStats()
  })
}

getList()
getStats()
</script>

<style lang="scss" scoped>
.schedule-card {
  margin-bottom: 16px;
}
.schedule-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.schedule-card-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  .el-icon {
    color: #409eff;
  }
}
.schedule-card-more {
  font-size: 13px;
  color: #909399;
  text-decoration: none;
  &:hover {
    color: #409eff;
  }
}
.schedule-card-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  .el-button.is-link {
    font-size: 13px;
    padding: 0 4px;
  }
}
.schedule-quick-add {
  margin-bottom: 12px;
}
.schedule-stat {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  padding: 4px 2px 10px;
  b {
    font-size: 15px;
  }
  .c-warning {
    color: #e6a23c;
  }
  .c-success {
    color: #67c23a;
  }
  .c-danger {
    color: #f56c6c;
  }
}
.schedule-list {
  min-height: 60px;
}
.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 4px;
  min-height: 44px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  &:last-child {
    border-bottom: none;
  }
  .el-checkbox {
    margin-top: 3px;
  }
  .schedule-item-main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    min-width: 0;
  }
  .schedule-item-title {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    line-height: 20px;
    color: #303133;
  }
  .schedule-item-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .schedule-item-time {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: #909399;
    &.overdue {
      color: #f56c6c;
      font-weight: 500;
    }
  }
}
.ml6 {
  margin-left: 6px;
}
</style>
