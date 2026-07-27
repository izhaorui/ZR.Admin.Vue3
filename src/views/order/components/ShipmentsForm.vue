<template>
  <el-dialog title="订单发货" v-model="open" width="370px">
    <el-form :model="form" label-position="right" :rules="rules" ref="formRef" label-width="80px">
 
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="form.orderNo" disabled></el-input>
      </el-form-item>
      <el-form-item label="物流公司" prop="deliveryCompany">
        <el-select v-model="form.deliveryCompany" allow-create clearable filterable>
          <el-option v-for="item in options.deliveryCompanyOptions" :value="item.dictValue">
            {{ item.dictLabel }}
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="物流单号" prop="deliveryNo">
        <el-input
          v-model="form.deliveryNo"
          maxlength="40"
          placeholder="请输入或扫描物流单号"
          @keyup.enter="handleSubmit">
        </el-input>
        <div class="form-tip">支持扫码枪录入：聚焦后扫描，扫描完成（回车）自动提交发货</div>
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
import { deliveryOrder } from '@/api/shopping/omsorder'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()

const state = reactive({
  form: {},
  rules: {
    deliveryNo: [
      { required: true, message: '请输入物流单号', trigger: 'blur' },
      { pattern: /^[A-Za-z0-9-]+$/, message: '单号只能包含字母、数字和短横线', trigger: 'blur' },
      { min: 6, max: 40, message: '单号长度一般为 6-40 位', trigger: 'blur' }
    ],
    deliveryCompany: [{ required: true, message: '请选择物流公司', trigger: 'blur' }]
  },
  options: {
    deliveryCompanyOptions: [
      { dictLabel: '顺丰速运', dictValue: '顺丰速运' },
      { dictLabel: '京东物流', dictValue: '京东物流' },
      { dictLabel: '中通快递', dictValue: '中通快递' },
      { dictLabel: '圆通速递', dictValue: '圆通速递' },
      { dictLabel: '申通快递', dictValue: '申通快递' },
      { dictLabel: '韵达快递', dictValue: '韵达快递' },
      { dictLabel: '中国邮政速递', dictValue: '中国邮政速递' },
      { dictLabel: '德邦快递', dictValue: '德邦快递' }
    ]
  }
})
const emits = defineEmits(['success'])
const { form, rules, options } = toRefs(state)
const open = ref(false)
const formRef = ref()
// 重置表单
function reset() {
  state.form = {
    deliveryCompany: undefined,
    deliveryNo: undefined,
    orderNo: '',
    id: undefined ,
		addressSnapshot: {}
  }

  proxy.resetForm('formRef')
}

function handleOpen(row) {
  reset()
  form.value.orderNo = row.orderNo
  form.value.id = row.id
  form.value.addressSnapshot = row.addressSnapshot
  open.value = true
}

/**
 * 发货
 */
function handleSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return

    deliveryOrder(form.value).then(() => {
      ElMessage.success('发货成功')
      open.value = false
      emits('success')
    })
  })
}

defineExpose({
  handleOpen
})
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  margin-top: 4px;
}
</style>
