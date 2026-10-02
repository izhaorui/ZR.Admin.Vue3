<!--
 * 运费模板下拉（商品编辑页用）
 *
 * clearable：不选即"走默认模板 / 计 0 运费"，是合法配置，故必须能清空。
 * 模板一次性全量拉取（数量级只有几十条），不做懒加载。
 * 默认模板排在最前并在标签上标出，避免运营在长列表里猜哪个是兜底的。
-->
<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :loading="loading"
    :disabled="disabled"
    clearable
    filterable
    style="width: 100%"
    @update:model-value="handleChange"
    @visible-change="handleVisible">
    <el-option v-for="t in options" :key="t.id" :label="t.label" :value="t.id" />
  </el-select>
</template>

<script setup name="FreightTemplateSelect">
import { listAllFreightTemplate } from '@/api/shopping/freightTemplate'

const props = defineProps({
  /** 绑定的模板 Id（null / undefined = 未绑定） */
  modelValue: { type: [Number, null], default: null },
  placeholder: { type: String, default: '不选则按默认模板 / 计 0 运费' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const { proxy } = getCurrentInstance()
const loading = ref(false)
const options = ref([])
/** 已拉取过就不再重复请求：商品编辑弹窗可能被多次打开 */
const loaded = ref(false)

async function load() {
  if (loaded.value) return
  loading.value = true
  try {
    const res = await listAllFreightTemplate()
    if (res.code === 200) {
      const list = res.data || []
      options.value = list.map((t) => {
        const parts = [`运费 ${t.freight} 元`]
        if (t.chargeType === 2) parts.push('按重')
        else parts.push('按件')
        return {
          id: t.id,
          // 默认模板排在前面（后端已按 IsDefault 倒序返回），这里只在标签上标出来
          label: `${t.templateName}（${parts.join(' · ')}${t.isDefault === 1 ? ' · 默认' : ''}）`
        }
      })
      loaded.value = true
    }
  } catch (e) {
    // 拉不到就保持空列表：商品仍可正常编辑保存，只是不显示模板名，
    // 绝不因为下拉失败而阻断商品编辑
    proxy.$modal?.msgError?.('运费模板列表加载失败')
    console.error('[FreightTemplateSelect] 加载运费模板失败', e)
  } finally {
    loading.value = false
  }
}

/** 首次展开时才请求：多数商品没配过运费模板，不该一进页面就多一个请求 */
function handleVisible(visible) {
  if (visible) load()
}

function handleChange(value) {
  emit('update:modelValue', value ?? null)
  emit('change', value ?? null)
}

// 组件挂载后静默预热一次，让商品保存时不因下拉为空而看不到当前绑定项
onMounted(load)
</script>
