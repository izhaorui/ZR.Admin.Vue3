<template>
  <el-form ref="singleSkuFormRef" :model="form.singleSku" :rules="rules" label-position="left" label-width="110px">
    <el-form-item label="规格图片" prop="imageUrl">
      <!-- <UploadImage v-model="form.singleSku.imageUrl" :limit="1"></UploadImage> -->
      <ImageSelector v-model="form.singleSku.imageUrl" :limit="1" :file-size="10" width="120px" height="120px"></ImageSelector>
    </el-form-item>
    <el-form-item :label="'商品价格' + $t('currency')" prop="price">
      <!-- min 必须是 0，不能是 0.01：el-input-number 会把低于 min 的绑定值**静默钳制成 min 并回写**
           （源码 watch(modelValue, { immediate: true }) → verifyValue(value, true) → emit）。
           于是"没填价格"的 0 会变成 0.01，反而通过了"价格须为正数"的校验，
           商品就以 1 分钱上架且毫无提示。min=0 时未填就是 0，会被提交前的校验明确拦下。 -->
      <el-input-number v-model="form.singleSku.price" :min="0" />
      <div v-if="!(form.singleSku.price > 0)" class="cell-tip cell-tip--error">价格需大于 0，否则无法上架</div>
    </el-form-item>
    <el-form-item label="库存数量" prop="stock">
      <el-input-number v-model="form.singleSku.stock" :min="0" />
      <div v-if="Number(form.singleSku.stock) === 0" class="cell-tip cell-tip--warning">库存为 0，前台会显示售罄</div>
    </el-form-item>
    <el-form-item label="商品重量(KG)" prop="weight">
      <el-input-number v-model="form.singleSku.weight" :min="0" />
      <div v-if="!Number(form.singleSku.weight)" class="cell-tip">未填写重量，若按重量计运费会算作 0</div>
    </el-form-item>
  </el-form>
</template>
<script setup>
const form = reactive({
  singleSku: {
    price: 0,
    stock: 0,
    weight: 0,
    imageUrl: '',
    specs: [{ name: '规格', value: '默认' }]
  },
  skus: []
})
const rules = {
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入重量', trigger: 'blur' }]
}
const props = defineProps({
  skus: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:skus', 'update:specList'])

// 监听父组件传进来的 skus 数组，转为 singleSku 对象
watch(
  () => props.skus,
  (val) => {
    if (val && val.length > 0) {
      const sku = val[0]
      // 这里用 Object.assign 保持响应式
      Object.assign(form.singleSku, sku)
    } else {
      Object.assign(form.singleSku, {
        price: 0,
        stock: 0,
        weight: 0,
        imageUrl: '',
        specs: [{ name: '规格', value: '默认' }]
      })
    }
  },
  { immediate: true, deep: true }
)

// 监听 singleSku 变化，转成数组格式回传父组件
watch(
  form.singleSku,
  (val) => {
    emit('update:skus', [{ ...val }])
    emit('update:specList', [{ name: '规格', values: ['默认'] }])
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.cell-tip {
  flex-basis: 100%;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  &--error {
    color: var(--el-color-danger);
  }
  &--warning {
    color: var(--el-color-warning);
  }
}
</style>
