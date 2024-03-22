<template>
  <div class="app-container">
    <el-form :model="queryParams" inline @submit.prevent ref="queryRef" v-show="searchToggle">
      <el-form-item prop="taskType">
        <el-select clearable v-model="queryParams.taskType" placeholder="请选择任务类型">
          <el-option v-for="item in options.taskTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="parseInt(item.dictValue)" />
        </el-select>
      </el-form-item>
      <el-form-item prop="queryText">
        <el-input v-model="queryParams.queryText" placeholder="请输入计划任务名称" clearable @keyup.enter="handleQuery" @clear="handleQuery" />
      </el-form-item>
      <el-form-item prop="isStart">
        <el-radio-group v-model="queryParams.isStart" @change="handleQuery()">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button :value="item.dictValue" v-for="item in options.isStartOptions">{{ item.dictLabel }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="viewSwitch">
        <el-radio-group v-model="viewSwitch">
          <el-radio-button value="1">表格</el-radio-button>
          <el-radio-button value="2">卡片</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="handleReset">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>

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
      <right-toolbar :showSearch="searchToggle" :columns="columns" @queryTable="handleQuery"></right-toolbar>
    </el-row>
    <el-table v-if="viewSwitch == 1" ref="tasks" v-loading="loading" :data="dataTasks" border row-key="id" @sort-change="handleSortable">
      <!-- <el-table-column type="index" :index="handleIndexCalc" label="#" align="center" /> -->
      <el-table-column prop="id" label="id" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('id')" />
      <el-table-column prop="name" label="任务名称" width="100" />
      <el-table-column prop="taskType" label="任务类型" align="center" v-if="columns.showColumn('taskType')">
        <template #default="scope">
          <dict-tag :options="options.taskTypeOptions" :value="scope.row.taskType" />
        </template>
      </el-table-column>
      <el-table-column prop="triggerType" label="触发器类型" align="center" v-if="columns.showColumn('triggerType')">
        <template #default="scope">
          <dict-tag :options="options.triggerTypeOptions" :value="scope.row.triggerType" />
        </template>
      </el-table-column>
      <el-table-column sortable prop="isStart" align="center" label="任务状态" width="100">
        <template #default="scope">
          <dict-tag :value="scope.row.isStart" :options="options.isStartOptions"></dict-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="jobGroup"
        :show-overflow-tooltip="true"
        align="center"
        label="任务分组"
        width="80"
        v-if="columns.showColumn('jobGroup')" />
      <el-table-column prop="assemblyName" label="程序集名称" v-if="columns.showColumn('assemblyName')" :show-overflow-tooltip="true" />
      <el-table-column prop="className" label="任务类名" v-if="columns.showColumn('className')" />
      <el-table-column prop="runTimes" align="center" label="运行次数" width="80" />
      <el-table-column prop="intervalSecond" align="center" label="执行间隔(s)" v-if="columns.showColumn('intervalSecond')" width="90" />
      <el-table-column prop="cron" align="center" label="运行表达式" v-if="columns.showColumn('cron')" :show-overflow-tooltip="true" />
      <el-table-column prop="remark" align="center" label="备注" v-if="columns.showColumn('remark')" :show-overflow-tooltip="true" />
      <el-table-column prop="jobParams" label="任务参数" align="center" :show-overflow-tooltip="true" v-if="columns.showColumn('jobParams')" />
      <el-table-column
        prop="lastRunTime"
        label="最后运行时间"
        align="center"
        :show-overflow-tooltip="true"
        v-if="columns.showColumn('lastRunTime')" />
      <el-table-column prop="apiUrl" label="网络请求地址" v-if="columns.showColumn('apiUrl')" />
      <el-table-column label="操作" width="190" align="center">
        <template #default="scope">
          <el-button text icon="view" v-hasPermi="['monitor:job:query']" @click="handleDetails(scope.row)">
            {{ $t('btn.details') }}
          </el-button>
          <el-button text icon="view" v-hasPermi="['monitor:job:query']" @click="handleJobLog(scope.row)">
            {{ $t('btn.log') }}
          </el-button>

          <el-dropdown @command="handleCommand($event, scope.row)">
            <el-button text class="ml5">
              {{ $t('btn.more') }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>

            <template #dropdown>
              <el-dropdown-menu>
                <div v-hasPermi="['monitor:job:run']" v-if="scope.row.isStart">
                  <el-dropdown-item command="run">
                    <el-button icon="remove" title="运行一次"> {{ $t('btn.run') }}一次 </el-button>
                  </el-dropdown-item>
                </div>
                <div v-if="scope.row.isStart" v-hasPermi="['monitor:job:stop']">
                  <el-dropdown-item command="stop">
                    <el-button type="danger" icon="video-pause" title="停止">
                      {{ $t('btn.stop') }}
                    </el-button>
                  </el-dropdown-item>
                </div>
                <div v-if="!scope.row.isStart" v-hasPermi="['monitor:job:start']">
                  <el-dropdown-item command="start">
                    <el-button icon="video-play" title="启动">
                      {{ $t('btn.start') }}
                    </el-button>
                  </el-dropdown-item>
                </div>
                <div v-if="!scope.row.isStart" v-hasPermi="['monitor:job:edit']">
                  <el-dropdown-item command="update">
                    <el-button icon="edit" title="编辑">
                      {{ $t('btn.edit') }}
                    </el-button>
                  </el-dropdown-item>
                </div>
                <div v-if="!scope.row.isStart" v-hasPermi="['monitor:job:delete']">
                  <el-dropdown-item command="delete">
                    <el-button icon="delete" title="删除">
                      {{ $t('btn.delete') }}
                    </el-button>
                  </el-dropdown-item>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-row :gutter="20" v-if="viewSwitch == 2">
      <el-col v-for="item in dataTasks" :lg="8" :span="24">
        <el-card :body-style="{ padding: '15px 15px 0' }">
          <el-descriptions :column="1" :title="item.name" size="small" border>
            <el-descriptions-item label="任务类型">
              <dict-tag :options="options.taskTypeOptions" :value="item.taskType" />
            </el-descriptions-item>
            <el-descriptions-item label="触发器类型" width="90px">
              <dict-tag :options="options.triggerTypeOptions" :value="item.triggerType" />
            </el-descriptions-item>
            <el-descriptions-item label="任务状态" width="90px">
              <dict-tag :options="options.isStartOptions" :value="item.isStart"></dict-tag>
            </el-descriptions-item>
            <el-descriptions-item label="任务分组" width="90px">
              {{ item.jobGroup }}
            </el-descriptions-item>
            <el-descriptions-item label="程序集" width="90px">
              {{ item.assemblyName }}
            </el-descriptions-item>
            <el-descriptions-item label="最后运行时间" width="90px">
              {{ item.lastRunTime }}
            </el-descriptions-item>
            <el-descriptions-item label="运行表达式" width="90px">
              {{ item.cron }}
            </el-descriptions-item>
            <el-descriptions-item label="运行次数" width="90px">
              {{ item.runTimes }}
            </el-descriptions-item>
            <el-descriptions-item label="apiUrl" width="90px">
              {{ item.apiUrl }}
            </el-descriptions-item>
          </el-descriptions>
          <div>
            <el-button text icon="view" v-hasPermi="['monitor:job:query']" @click="handleDetails(item)">
              {{ $t('btn.details') }}
            </el-button>
            <el-button text icon="view" v-hasPermi="['monitor:job:query']" @click="handleJobLog(item)">
              {{ $t('btn.log') }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <pagination v-model:total="total" v-model:page="queryParams.PageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="600px" draggable append-to-body>
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
                <el-option
                  v-for="item in options.triggerTypeOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="parseInt(item.dictValue)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="任务分组" maxlength="200" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择任务分组">
                <el-option
                  v-for="dict in options.jobGroupOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="任务类型" prop="taskType">
              <el-radio-group v-model="form.taskType">
                <el-radio :value="1">执行程序集</el-radio>
                <el-radio :value="2">执行url</el-radio>
                <el-radio :value="3">执行SQL语句</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :lg="24" v-if="form.taskType == 2">
            <el-form-item label="apiUrl" prop="apiUrl">
              <el-input v-model="form.apiUrl" placeholder="远程调用接口url">
                <template #prepend>
                  <el-select v-model="form.requestMethod" placeholder="请选择请求方式" style="width: 125px">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="24" v-if="form.taskType == 3">
            <el-form-item label="SQL语句" prop="sqlText">
              <el-input :rows="5" type="textarea" v-model="form.sqlText" placeholder="请输入SQL语句，批量执行SQL请换行"> </el-input>
            </el-form-item>
          </el-col>
          <template v-if="form.taskType == 1">
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
                  <el-tooltip content="eg：{ token: abc123} or token=abc123&uid=1000" placement="top">
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
                <template #append>
                  <el-button type="primary" @click="handleShowCron" style="width: 80px">
                    生成表达式
                    <el-icon><time /></el-icon>
                  </el-button>
                </template>
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
          <el-col :lg="24">
            <el-form-item label="最后运行时间" prop="lastRunTime">
              {{ form.lastRunTime }}
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

    <el-dialog title="Cron表达式生成器" v-model="openCron" append-to-body destroy-on-close>
      <crontab ref="crontabRef" @hide="openCron = false" @fill="crontabFill" :expression="expression"></crontab>
    </el-dialog>

    <el-drawer :title="logTitle" v-model="drawer">
      <el-form :inline="true" @submit.prevent>
        <el-form-item>
          <el-date-picker v-model="logForm.beginTime" placeholder="请选择时间" clearable type="date" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleJobLog">{{ $t('btn.search') }}</el-button>
        </el-form-item>
      </el-form>

      <el-timeline>
        <el-timeline-item :timestamp="item.createTime" placement="top" v-for="(item, i) in jobLogList" :key="i">
          <h4>{{ item.jobMessage }}</h4>
          <p style="color: red">{{ item.exception }}</p>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="jobLogList.length <= 0"></el-empty>
    </el-drawer>
  </div>
</template>

<script setup name="job">
import { queryTasks, getTasks, createTasks, updateTasks, deleteTasks, startTasks, stopTasks, runTasks, exportTasks } from '@/api/monitor/job'
import { listJobLog } from '@/api/monitor/jobLog'
import Crontab from '@/components/Crontab'

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
const loading = ref(false)
// 查询参数
const queryParams = reactive({
  queryText: undefined,
  PageNum: 1,
  pageSize: 10,
  orderby: '',
  sort: '',
  taskType: undefined,
  isStart: ''
})
const columns = ref([
  // { visible: true, prop: 'name', label: '名称' },
  { visible: true, prop: 'taskType', label: '任务类型' },
  { visible: true, prop: 'triggerType', label: '触发器类型' },
  { visible: true, prop: 'jobGroup', label: '任务分组' },
  { visible: true, prop: 'assemblyName', label: '程序集名称' },
  { visible: true, prop: 'className', label: '类名' },
  { visible: true, prop: 'lastRunTime', label: '最后运行时间' },
  { visible: false, prop: 'remark', label: '备注' },
  { visible: false, prop: 'id', label: '任务id' },
  { visible: false, prop: 'cron', label: 'cron表达式' },
  // { visible: true, prop: 'runTimes', label: '运行次数' },
  // { visible: false, prop: 'beginTime', label: '开始时间' },
  // { visible: false, prop: 'endTime', label: '结束时间' },
  { visible: false, prop: 'intervalSecond', label: '执行每隔(s)' },
  // { visible: false, prop: 'isStart', label: '是否启动' },
  { visible: false, prop: 'jobParams', label: '任务参数' },
  { visible: false, prop: 'apiUrl', label: '网络请求地址' }
  // { visible: false, prop: 'sqlText', label: 'sql脚本' }
])
// 计划任务列表
const dataTasks = ref([])
// 任务日志列表
const jobLogList = ref([])
const logTitle = ref('')
const formRef = ref(null)
const queryRef = ref(null)
const viewSwitch = ref(1)
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
    cron: [{ required: true, message: 'cron表达式不能为空', trigger: 'change' }],
    beginTime: [{ required: false, message: '请选择开始日期', trigger: 'blur' }],
    endTime: [{ required: false, message: '请选择结束日期', trigger: 'blur' }],
    intervalSecond: [{ message: '请设置执行间隔', type: 'number', trigger: 'blur' }],
    sqlText: [{ required: true, message: '请输入sql语句', trigger: 'blur' }],
    requestMethod: [{ required: true, message: '请选择请求方式', trigger: 'blur' }]
  },
  options: {
    // 触发器类型
    triggerTypeOptions: [
      { dictLabel: '普通', dictValue: '0' },
      { dictLabel: '表达式', dictValue: '1' }
    ],
    taskTypeOptions: [
      { dictLabel: '程序集', dictValue: '1' },
      { dictLabel: 'api请求', dictValue: '2', listClass: 'danger' },
      { dictLabel: 'sql脚本', dictValue: '3', listClass: 'info' }
    ],
    // 任务状态字典
    isStartOptions: [
      { dictLabel: '运行中', dictValue: '1', listClass: 'success' },
      { dictLabel: '已停止', dictValue: '0', listClass: 'danger' }
    ],
    // 任务组名字典
    jobGroupOptions: []
  }
})
// 按钮是否可见
const btnVisible = ref(true)
const { rules, form, options } = toRefs(state)

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
  proxy.resetForm('queryRef')
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
  expression.value = form.value.cron
  openCron.value = true
}
/** 确定后回传值 */
function crontabFill(value) {
  form.value.cron = value
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
function handleSortable(column) {
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
    taskType: 1,
    requestMethod: 'GET'
  }
  proxy.resetForm('formRef')
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
  state.options.jobGroupOptions = response.data
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

function handleCommand(command, row) {
  console.log(command, row)
  switch (command) {
    case 'update':
      handleUpdate(row)
      break
    case 'start':
      handleStart(row)
      break
    case 'stop':
      handleStop(row)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'run':
      handleRun(row)
      break
  }
}
</script>
