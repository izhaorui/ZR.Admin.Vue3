<template>
  <div class="app-container">
    <el-row v-if="searchToggle" :gutter="20">
      <el-col>
        <el-form :inline="true" @submit.prevent>
          <el-form-item>
            <el-input
              v-model="queryParams.queryText"
              placeholder="请输入计划任务名称"
              clearable
              prefix-icon="el-icon-search"
              @keyup.enter="handleQuery"
              @clear="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
            <el-button icon="refresh" @click="handleReset">{{ $t('btn.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row class="mb8" :gutter="20">
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:add']" plain type="primary" icon="plus" @click="handleCreate">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="download" @click="handleExport" v-hasPermi="['monitor:job:export']">
          {{ $t('btn.export') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain v-hasPermi="['monitor:job:query']" type="info" icon="operation" @click="onJobLogView()">
          {{ $t('btn.log') }}
        </el-button>
      </el-col>
      <right-toolbar :showSearch="searchToggle" @queryTable="handleQuery"></right-toolbar>
    </el-row>
    <el-row>
      <el-table ref="tasks" v-loading="loading" :data="dataTasks" border="" row-key="id" @sort-change="handleSortable">
        <el-table-column type="index" :index="handleIndexCalc" label="#" align="center" />
        <el-table-column prop="name" label="任务名称" width="100" />
        <el-table-column prop="jobGroup" :show-overflow-tooltip="true" align="center" label="任务分组" width="80" />
        <el-table-column prop="assemblyName" align="center" label="程序集名称" :show-overflow-tooltip="true" />
        <el-table-column prop="className" align="center" label="任务类名" :show-overflow-tooltip="true" />
        <el-table-column prop="runTimes" align="center" label="运行次数" width="80" />
        <el-table-column prop="intervalSecond" align="center" label="执行间隔(s)" width="90" />
        <el-table-column prop="cron" align="center" label="运行表达式" :show-overflow-tooltip="true" />
        <el-table-column sortable prop="isStart" align="center" label="任务状态" width="100">
          <template #default="scope">
            <dict-tag :value="scope.row.isStart" :options="isStartOptions"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRunTime" align="center" label="最后运行时间" :show-overflow-tooltip="true" />
        <el-table-column prop="remark" align="center" label="备注" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-link size="small" class="ml10" icon="view" v-hasPermi="['monitor:job:query']" @click="handleDetails(scope.row)">
              {{ $t('btn.details') }}
            </el-link>
            <el-link size="small" class="ml10" icon="view" v-hasPermi="['monitor:job:query']" @click="handleJobLog(scope.row)">
              {{ $t('btn.log') }}
            </el-link>
            <el-link
              size="small"
              class="ml10"
              type="primary"
              v-if="scope.row.isStart"
              v-hasPermi="['monitor:job:run']"
              icon="remove"
              title="运行"
              @click="handleRun(scope.row)">
              {{ $t('btn.run') }}
            </el-link>
            <el-link
              type="warning"
              size="small"
              class="ml10"
              v-if="scope.row.isStart"
              v-hasPermi="['monitor:job:stop']"
              icon="video-pause"
              style="color: red"
              title="停止"
              @click="handleStop(scope.row)">
              {{ $t('btn.stop') }}
            </el-link>

            <el-link
              type="primary"
              size="small"
              class="ml10"
              v-if="!scope.row.isStart"
              v-hasPermi="['monitor:job:start']"
              icon="video-play"
              title="启动"
              @click="handleStart(scope.row)">
              {{ $t('btn.start') }}
            </el-link>
            <el-link
              class="ml10"
              size="small"
              type="info"
              v-if="!scope.row.isStart"
              v-hasPermi="['monitor:job:edit']"
              icon="edit"
              title="编辑"
              @click="handleUpdate(scope.row)">
              {{ $t('btn.edit') }}
            </el-link>

            <el-link
              type="danger"
              class="ml10"
              size="small"
              v-if="!scope.row.isStart"
              v-hasPermi="['monitor:job:delete']"
              icon="delete"
              title="删除"
              @click="handleDelete(scope.row)">
              {{ $t('btn.delete') }}
            </el-link>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-model:total="total" v-model:page="queryParams.PageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-row>

    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :lg="24" v-if="form.id">
            <el-form-item label="任务ID">
              <div>{{ form.id }}</div>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="任务名称" maxlength="200" prop="name">
              <el-input v-model="form.name" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="触发器类型" prop="triggerType">
              <el-select v-model="form.triggerType" placeholder="请选择触发器类型" style="width: 100%">
                <el-option v-for="item in triggerTypeOptions" :key="item.value" :label="item.label" :value="parseInt(item.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="任务分组" maxlength="200" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择">
                <el-option v-for="dict in jobGroupOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="任务类型" prop="taskType">
              <el-radio-group v-model="form.taskType">
                <el-radio :label="1">执行程序集</el-radio>
                <el-radio :label="2">执行url</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :lg="24" v-if="form.taskType == 2">
            <el-form-item label="apiUrl" prop="apiUrl">
              <el-input v-model="form.apiUrl" placeholder="远程调用接口url">
                <template #prepend>http://</template>
              </el-input>
            </el-form-item>
          </el-col>
          <template v-else>
            <el-col :lg="24">
              <el-form-item label="程序集名称" maxlength="200" prop="assemblyName">
                <el-input v-model="form.assemblyName" placeholder="请输入程序集名称" />
              </el-form-item>
            </el-col>
            <el-col :lg="24">
              <el-form-item label="任务类名" maxlength="200" prop="className">
                <el-input v-model="form.className" placeholder="请输入任务类名" />
              </el-form-item>
            </el-col>
          </template>

          <el-col :lg="24">
            <el-form-item label="传入参数" prop="jobParams">
              <template #label>
                <span>
                  <el-tooltip content="eg：{ token: abc123}" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  传入参数
                </span>
              </template>

              <el-input v-model="form.jobParams" placeholder="传入参数" />
            </el-form-item>
          </el-col>
          <el-col :lg="24" v-if="form.triggerType == 1">
            <el-form-item label="间隔(Cron)" prop="cron">
              <el-input v-model="form.cron" placeholder="请输入cron执行表达式">
                <!-- <template #append>
                  <el-button type="primary" @click="handleShowCron" style="width: 80px">
                    生成表达式
                    <el-icon><time /></el-icon>
                  </el-button>
                </template> -->
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="开始日期" prop="beginTime">
              <template #label>
                <span>
                  <el-tooltip content="如果不写开始时间和结束时间，任务将以当前时间开始执行，到9999年结束" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  开始日期
                </span>
              </template>
              <el-date-picker v-model="form.beginTime" style="width: 100%" type="date" placeholder="选择开始日期" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="结束日期" prop="endTime">
              <el-date-picker v-model="form.endTime" style="width: 100%" type="date" placeholder="选择结束日期" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item v-show="form.triggerType == 0" label="执行间隔(秒)" prop="intervalSecond">
              <el-input-number v-model="form.intervalSecond" :max="9999999999" step-strictly controls-position="right" :min="1" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="备注" prop="remark">
              <el-input type="textarea" v-model="form.remark" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="btnVisible">
        <div class="dialog-footer">
          <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
          <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="Cron表达式生成器" v-model="openCron" destroy-on-close>
      <!-- 使用组件例子 -->
      <Vue3CronCore i18n="cn" maxHeight="350px" @change="changeCron" v-model:value="form.cron" style="flex: 0.4" />
    </el-dialog>

    <el-drawer :title="logTitle" v-model="drawer">
      <el-form :inline="true" @submit.prevent>
        <el-form-item>
          <el-date-picker v-model="logForm.beginTime" clearable type="date" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleJobLog">{{ $t('btn.search') }}</el-button>
        </el-form-item>
      </el-form>

      <el-timeline>
        <el-timeline-item :timestamp="item.createTime" placement="top" v-for="(item, i) in jobLogList" :key="i">
          <h4>{{ item.jobMessage }}</h4>
          <p>{{ item.exception }}</p>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="jobLogList.length <= 0"></el-empty>
    </el-drawer>
  </div>
</template>

<script setup name="job">
import { queryTasks, getTasks, createTasks, updateTasks, deleteTasks, startTasks, stopTasks, runTasks, exportTasks } from '@/api/monitor/job'
import { listJobLog } from '@/api/monitor/jobLog'
import Vue3CronCore from '@/components/vue3-cron-core/Index.vue'

const router = useRouter()
const { proxy } = getCurrentInstance()
// 是否显示Cron表达式弹出层
const openCron = ref(false)
// 传入的表达式
const expression = ref('')
const drawer = ref(false)
// 是否显示弹出层
const open = ref(false)
// 表单标题
const title = ref('')
// 显示搜索
const searchToggle = ref(true)
// 合计条数
const total = ref(0)
// 遮罩层
const loading = ref(true)
// 查询参数
const queryParams = reactive({
  queryText: undefined,
  PageNum: 1,
  pageSize: 10,
  orderby: 'createTime',
  sort: 'descending'
})
// 计划任务列表
const dataTasks = ref([])
// 任务日志列表
const jobLogList = ref([])
const logTitle = ref('')
const formRef = ref(null)
// 任务状态字典
const isStartOptions = ref([
  { dictLabel: '运行中', dictValue: 'true', listClass: 'success' },
  { dictLabel: '已停止', dictValue: 'false' }
])
// 任务组名字典
const jobGroupOptions = ref([])
// 触发器类型
const triggerTypeOptions = ref([
  {
    label: '[普通]',
    value: 0
  },
  {
    label: '[表达式]',
    value: 1
  }
])
const state = reactive({
  form: {},
  // 表单校验
  rules: {
    name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
    jobGroup: [{ required: true, message: '任务分组不能为空', trigger: 'blur' }],
    assemblyName: [{ required: true, message: '程序集名称不能为空', trigger: 'blur' }],
    className: [{ required: true, message: '任务类名不能为空', trigger: 'blur' }],
    triggerType: [{ required: true, message: '请选择触发器类型', trigger: 'blur' }],
    apiUrl: [{ required: true, message: '请输入apiUrl地址', trigger: 'blur' }],
    cron: [{ required: true, message: '请输入cron表达式', trigger: 'blur' }],
    beginTime: [{ required: false, message: '请选择开始日期', trigger: 'blur' }],
    endTime: [{ required: false, message: '请选择结束日期', trigger: 'blur' }],
    intervalSecond: [{ message: '请设置执行间隔', type: 'number', trigger: 'blur' }]
  }
})
// 按钮是否可见
const btnVisible = ref(true)
const { rules, form } = toRefs(state)
// 时间的选择
// const pickerOptions = reactive({
//   disabledDate(time) {
//     return time.getTime() < Date.now() - 8.64e7
//   },
// })
/** 查询计划任务列表 */
function getList() {
  loading.value = true
  queryTasks(queryParams).then((response) => {
    dataTasks.value = response.data.result
    total.value = response.data.totalNum
    loading.value = false
  })
}
function handleQuery() {
  getList()
}
/** 重置按钮操作 */
function handleReset() {
  queryParams.queryText = ''
  getList()
}
/** 新增按钮操作 */
function handleCreate() {
  reset()
  btnVisible.value = true
  open.value = true
  title.value = '添加计划任务'
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  btnVisible.value = true
  getTasks(row.id).then((res) => {
    form.value = res.data
    open.value = true
    title.value = '修改计划任务'
  })
}

/** cron表达式按钮操作 */
function handleShowCron() {
  // expression.value = form.value.cron
  openCron.value = true
}
/** 确定后回传值 */
const changeCron = (val) => {
  if (typeof val !== 'string') return false
  openCron.value = false
  form.value.cron = val
}
// 启动按钮
function handleStart(row) {
  startTasks(row.id).then((response) => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess(response.msg)
      open.value = false
      getList()
    }
  })
}
// 停止按钮
function handleStop(row) {
  stopTasks(row.id).then((response) => {
    if (response.code === 200) {
      proxy.$modal.msgSuccess(response.msg)
      open.value = false
      getList()
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const jobInfo = row

  proxy
    .$confirm('是否确认删除名称为"' + jobInfo.name + '"的计划任务?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      deleteTasks(jobInfo.id).then((response) => {
        if (response.code === 200) {
          getList()
          proxy.$modal.msgSuccess('删除成功')
        }
      })
    })
    .catch(function () {})
}
/* 立即执行一次 */
function handleRun(row) {
  const jobInfo = row

  proxy
    .$confirm('确认要立即执行一次"' + jobInfo.name + '"任务吗?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then((res) => {
      runTasks(jobInfo.id).then((res) => {
        if (res.code === 200) {
          proxy.$modal.msgSuccess('执行成功')
          getList()
        }
      })
    })
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      if (form.value.id !== undefined) {
        updateTasks(form.value).then((response) => {
          if (response.code === 200) {
            proxy.$modal.msgSuccess('修改成功')
            open.value = false
            getList()
          }
        })
      } else {
        createTasks(form.value).then((response) => {
          if (response.code === 200) {
            proxy.$modal.msgSuccess('新增成功')
            open.value = false
            getList()
          }
        })
      }
    }
  })
}
// 排序操作
function handleSortable(val) {
  queryParams.orderby = val.prop
  queryParams.sort = val.order
  getList()
}
// 表单重置
function reset() {
  form.value = {
    id: undefined,
    name: undefined,
    jobGroup: undefined,
    assemblyName: 'ZR.Tasks',
    className: undefined,
    jobParams: undefined,
    triggerType: 1,
    beginTime: undefined,
    endTime: undefined,
    intervalSecond: 1,
    cron: undefined,
    taskType: 1
  }
  proxy.resetForm('formRef')
}
// 自动计算分页 Id
function handleIndexCalc(index) {
  return (queryParams.PageNum - 1) * queryParams.pageSize + index + 1
}
// 取消按钮
function cancel() {
  open.value = false
  reset()
}
/** 导出按钮操作 */
function handleExport() {
  proxy
    .$confirm('是否确认导出所有任务?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      return exportTasks()
    })
    .then((response) => {
      proxy.download(response.data.path)
    })
}

getList()
proxy.getDicts('sys_job_group').then((response) => {
  jobGroupOptions.value = response.data
})
watch(
  () => form.value.triggerType,
  (val) => {
    if (val == 0) {
      form.value.cron = ''
    }
  },
  {
    deep: true,
    immediate: true
  }
)

/** 任务日志 */

const logForm = reactive({
  beginTime: undefined,
  jobId: undefined,
  title: undefined
})
function onJobLogView() {
  router.push({ path: 'job/log' })
}
/** 任务日志列表查询 */
function handleJobLog(row) {
  if (undefined != row.id) {
    logForm.jobId = row.id
    logForm.title = row.name
  }

  drawer.value = true
  jobLogList.value = []
  logTitle.value = logForm.title
  listJobLog(logForm).then((response) => {
    jobLogList.value = response.data.result
  })
}
function handleDetails(row) {
  reset()
  getTasks(row.id).then((res) => {
    form.value = res.data
    open.value = true
    title.value = '详情'
    btnVisible.value = false
  })
}
</script>
