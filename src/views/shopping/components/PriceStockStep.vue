<template>
  <div>
    <el-form label-position="left" label-width="110px">
      <el-form-item label="规格类型">
        <el-radio-group v-model="info.specType" @change="handleSpecTypeChange">
          <el-radio-button :value="1">单规格</el-radio-button>
          <el-radio-button :value="2">多规格</el-radio-button>
        </el-radio-group>
        <div class="field-tip" :class="{ 'is-tip': !!specTypeTip }">
          <el-icon><InfoFilled /></el-icon>
          {{ specTypeTip || modeTip }}
        </div>
      </el-form-item>
    </el-form>

    <SingleSkuForm
      v-if="info.specType === 1"
      ref="singleSkuRef"
      :skus="skus"
      @update:skus="emit('update:skus', $event)"
      @update:specList="emit('update:specList', $event)" />
    <SpecForm
      v-else
      ref="specFormRef"
      :info="info"
      :spec-list="specList"
      :skus="skus"
      @update:spec-list="emit('update:specList', $event)"
      @update:skus="emit('update:skus', $event)" />

    <!-- 商品限购（单/多规格共用） -->
    <el-form label-position="left" label-width="110px" class="mt20">
      <el-form-item label="商品限购">
        <el-radio-group v-model="info.purchaseLimit.limit">
          <el-radio-button :value="false">不限购</el-radio-button>
          <el-radio-button :value="true">限购</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-row :gutter="10" style="margin-left: 100px" v-if="info.purchaseLimit.limit">
        <el-col :lg="24">
          <el-form-item label="总限购">
            <el-input-number v-model.number="info.purchaseLimit.totalLimit" :min="1" style="width: 100px"></el-input-number> 件/人
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="每单限购">
            <el-input-number v-model.number="info.purchaseLimit.singleLimit" :min="1" style="width: 100px"></el-input-number> 件/人
          </el-form-item>
        </el-col>
        <div class="text-muted" style="font-size: 13px">用于限制每人购买该商品的数量</div>
      </el-row>
    </el-form>
  </div>
</template>

<script setup name="PriceStockStep">
import SingleSkuForm from './SingleSkuForm.vue'
import SpecForm from './SpecForm.vue'

const props = defineProps({
  // 商品主体（form.data），规格类型与限购配置都挂在它上面
  info: {
    type: Object,
    default: () => ({})
  },
  specList: {
    type: Array,
    default: () => []
  },
  skus: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:specList', 'update:skus'])
const { proxy } = getCurrentInstance()

// 单选下方的说明只有一行：平时讲「这个模式是什么」，刚切换时临时改成「这次切换对数据的影响」
const TIP_DURATION = 10000
const specTypeTip = ref('')
let tipTimer = null

const modeTip = computed(() =>
  props.info.specType === 1
    ? '单规格：只填一行价格与库存，前台不显示规格选择'
    : '多规格：按各规格值的组合生成多行 SKU，可分别定价、设库存和图片'
)

function handleSpecTypeChange(value) {
  specTypeTip.value =
    value === 1
      ? '已切换：多规格的 SKU 明细不再显示，切回多规格可重新生成'
      : '已切换：SKU 已按规格值重新组合，原有组合的价格与库存会尽量保留'
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => (specTypeTip.value = ''), TIP_DURATION)
}

onBeforeUnmount(() => clearTimeout(tipTimer))

// 当前生效的是单规格表单还是多规格表单
function currentForm() {
  const comp = props.info.specType === 1 ? proxy.$refs.singleSkuRef : proxy.$refs.specFormRef
  return props.info.specType === 1 ? comp?.$refs?.singleSkuFormRef : comp?.$refs?.specFormRef
}

// 交给父组件在提交前调用，保持与基础信息同一种校验结果结构
function validate() {
  const formEl = currentForm()
  if (!formEl) {
    return Promise.resolve({ isValid: true, invalidFields: {} })
  }
  return new Promise((resolve) => {
    formEl.validate((isValid, invalidFields) => resolve({ isValid, invalidFields }))
  })
}

defineExpose({ validate })
</script>

<style scoped lang="scss">
.field-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-basis: 100%;
  width: 100%;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  // 刚切换时高亮一下，提示这条讲的是「本次切换的影响」
  &.is-tip {
    color: var(--el-color-primary);
  }
}
</style>
