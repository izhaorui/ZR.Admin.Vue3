<template>
  <el-dialog v-model="visible" :title="title" width="600px" draggable append-to-body>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-row>
        <el-col v-if="formData.id" :lg="24">
          <el-form-item label="任务ID">
            <div>{{ formData.id }}</div>
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="任务名称" maxlength="200" prop="name">
            <el-input v-model="formData.name" placeholder="请输入任务名称" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="触发器类型" prop="triggerType">
            <el-select v-model="formData.triggerType" placeholder="请选择触发器类型" style="width: 100%">
              <el-option
                v-for="item in options.triggerTypeOptions"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="parseInt(item.dictValue)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="错过执行" prop="misfirePolicy">
            <el-select v-model="formData.misfirePolicy" placeholder="请选择错过执行策略" style="width: 100%">
              <el-option
                v-for="item in options.misfirePolicyOptions"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="parseInt(item.dictValue)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="任务分组" maxlength="200" prop="jobGroup">
            <el-select v-model="formData.jobGroup" placeholder="请选择任务分组">
              <el-option v-for="dict in options.jobGroupOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="任务类型" prop="taskType">
            <el-radio-group v-model="formData.taskType">
              <el-radio :value="1">执行程序集</el-radio>
              <el-radio :value="2">执行url</el-radio>
              <el-radio :value="3">调用存储过程</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col v-if="formData.taskType == 2" :lg="24">
          <el-form-item label="apiUrl" prop="apiUrl">
            <el-input v-model="formData.apiUrl" placeholder="远程调用接口url">
              <template #prepend>
                <el-select v-model="formData.requestMethod" placeholder="请选择请求方式" style="width: 125px">
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col v-if="formData.taskType == 3" :lg="24">
          <el-form-item label="存储过程" prop="sqlText">
            <el-input v-model="formData.sqlText" placeholder="schema.dbo.eee @usid = 1, @bb = 3" @blur="validateSqlText" />
            <div class="tips-text">格式：schema.ProcedureName 参数</div>
          </el-form-item>
        </el-col>
        <template v-if="formData.taskType == 1">
          <el-col :lg="24">
            <el-form-item label="程序集名称" maxlength="200" prop="assemblyName">
              <el-input v-model="formData.assemblyName" placeholder="请输入程序集名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="任务类名" maxlength="200" prop="className">
              <el-input v-model="formData.className" placeholder="请输入任务类名" />
            </el-form-item>
          </el-col>
        </template>

        <el-col v-if="formData.taskType != 3" :lg="24">
          <el-form-item label="传入参数" prop="jobParams">
            <el-input v-model="formData.jobParams" placeholder="传入参数" />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.triggerType == 1" :lg="24">
          <el-form-item label="间隔(Cron)" prop="cron">
            <el-input v-model="formData.cron" placeholder="请输入cron执行表达式">
              <template #append>
                <el-button type="primary" style="width: 80px" @click="emit('show-cron')">
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
            <el-date-picker v-model="formData.beginTime" style="width: 100%" type="date" placeholder="选择开始日期" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="结束日期" prop="endTime">
            <el-date-picker v-model="formData.endTime" style="width: 100%" type="date" placeholder="选择结束日期" />
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item v-show="formData.triggerType == 0" label="执行间隔(秒)" prop="intervalSecond">
            <el-input-number v-model="formData.intervalSecond" :max="9999999999" step-strictly controls-position="right" :min="1" />
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="描述" prop="remark">
            <el-input v-model="formData.remark" type="textarea" />
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="最后运行时间" prop="lastRunTime">
            {{ formData.lastRunTime }}
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template v-if="btnVisible" #footer>
      <div class="dialog-footer">
        <el-button text @click="emit('cancel')">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="emit('submit')">{{ $t('btn.submit') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: ''
  },
  form: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  },
  btnVisible: Boolean
})
const emit = defineEmits(['update:modelValue', 'cancel', 'show-cron', 'submit'])
const formRef = ref()
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const formData = computed(() => props.form)

function resetFields() {
  formRef.value?.resetFields()
}

function validate(callback) {
  return formRef.value?.validate(callback)
}

function validateSqlText() {
  formRef.value?.validateField('sqlText')
}

defineExpose({ resetFields, validate })
</script>
