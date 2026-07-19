<template>
  <zr-dialog :title="title" v-model="visible" width="560px" append-to-body>
    <el-form ref="scheduleRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入日程标题" maxlength="200" show-word-limit />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="3" placeholder="请输入日程内容" maxlength="1000" show-word-limit />
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="form.priority">
          <el-radio-button :value="1">低</el-radio-button>
          <el-radio-button :value="2">中</el-radio-button>
          <el-radio-button :value="3">高</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="截止时间" prop="dueTime">
        <el-date-picker v-model="form.dueTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择截止时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="提醒时间" prop="reminderTime">
        <el-date-picker
          v-model="form.reminderTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="选择提醒时间"
          style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
    </template>
  </zr-dialog>
</template>

<script setup name="DailyScheduleForm">
import { getDailySchedule, addDailySchedule, updateDailySchedule } from '@/api/system/dailyschedule'
import { getCurrentInstance, ref, reactive, computed, watch, toRefs } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // 传入 id 为编辑模式，不传或为空为新增模式
  scheduleId: { type: [Number, String], default: undefined }
})
const emit = defineEmits(['update:modelValue', 'success'])

const { proxy } = getCurrentInstance()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const title = ref('')
const submitting = ref(false)
const scheduleRef = ref()

const data = reactive({
  form: { id: undefined, title: '', content: '', priority: 2, dueTime: '', reminderTime: '' },
  rules: {
    title: [{ required: true, message: '日程标题不能为空', trigger: 'blur' }]
  }
})
const { form, rules } = toRefs(data)

function reset() {
  form.value = { id: undefined, title: '', content: '', priority: 2, dueTime: '', reminderTime: '' }
  proxy.resetForm('scheduleRef')
}

watch(visible, (val) => {
  if (!val) return
  reset()
  if (props.scheduleId !== undefined && props.scheduleId !== null && props.scheduleId !== '') {
    title.value = '修改日程'
    getDailySchedule(props.scheduleId).then((res) => {
      form.value = res.data
    })
  } else {
    title.value = '新增日程'
  }
})

function submitForm() {
  proxy.$refs.scheduleRef.validate((valid) => {
    if (!valid) return
    submitting.value = true
    const api = form.value.id !== undefined ? updateDailySchedule : addDailySchedule
    api(form.value)
      .then(() => {
        proxy.$modal.msgSuccess(form.value.id !== undefined ? '修改成功' : '新增成功')
        visible.value = false
        emit('success')
      })
      .finally(() => {
        submitting.value = false
      })
  })
}
</script>
