<template>
  <el-dialog title="修改收件信息" v-model="open" width="400px">
    <el-form :model="form" label-position="right" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="form.orderNo" disabled></el-input>
      </el-form-item>
      <el-form-item label="收件人姓名" prop="userName">
        <el-input v-model="form.userName"></el-input>
      </el-form-item>
      <el-form-item label="收件人电话" prop="userName" allow-create>
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="所在地区" prop="province">
        <el-cascader
          v-model="region"
          :options="regionOptions"
          :props="{ expandTrigger: 'hover' }"
          placeholder="请选择省 / 市 / 区"
          clearable
          class="w100"
          @change="onRegionChange" />
      </el-form-item>
      <el-form-item label="地址详情" prop="detailAddress" allow-create>
        <el-input v-model="form.detailAddress"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="footer">
        <el-button text @click="open = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { updateOMSOrder } from '@/api/shopping/omsorder'
import { regionOptions } from '@/views/shopping/regions'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()

const state = reactive({
  form: {},
  rules: {
    userName: [{ required: true, message: '请输入', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入', trigger: 'blur' }],
    province: [{ required: true, message: '请选择所在地区', trigger: 'change' }],
    city: [{ required: false, message: '请输入', trigger: 'blur' }],
    district: [{ required: false, message: '请输入', trigger: 'blur' }],
    detailAddress: [{ required: true, message: '请输入', trigger: 'blur' }]
  },
  options: {}
})
const emits = defineEmits(['success'])
const { form, rules, options } = toRefs(state)
const open = ref(false)
const formRef = ref()
const region = ref([])
// 重置表单
function reset() {
  state.form = {
    orderNo: '',
    userName: undefined,
    phone: undefined,
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    operType: 3 //修改地址
  }
  region.value = []

  proxy.resetForm('formRef')
}

function onRegionChange(val) {
  const arr = val || []
  form.value.province = arr[0] || ''
  form.value.city = arr[1] || ''
  form.value.district = arr[2] || ''
}

/**
 *
 * @param orderNo 订单号
 * @param address 地址
 */
function handleOpen(orderNo, address) {
  reset()
  form.value = { ...address, orderNo }
  region.value = [address.province, address.city, address.district].filter(Boolean)
  open.value = true
}

/**
 * 发货
 */
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return

    updateOMSOrder({ AddressSnapshot: form.value, orderNo: form.value.orderNo, operType: 3 }).then(() => {
      ElMessage.success('修改成功')
      open.value = false
      emits('success')
    })
  })
}

defineExpose({
  handleOpen
})
</script>
