<template>
  <div v-loading="loading" class="form-fields-step">
    <!-- 元数据拿不到就没有预设与类型可选，给出重试，不静默留一个空面板 -->
    <el-alert v-if="metaError" type="error" :closable="false" show-icon class="mb10" title="字段类型与预设加载失败，暂时无法配置下单表单">
      <el-button type="primary" link @click="loadMeta">重新加载</el-button>
    </el-alert>

    <el-alert v-else type="info" :closable="false" show-icon class="mb10" title="下单时让买家额外填写的字段，不需要就一个都不勾">
      <ul class="form-fields-step__list">
        <li>勾选下方常用字段即可；标题、必填、候选项都能改。</li>
        <li>填写内容按下单那一刻<b>快照</b>保存：之后改标题或删字段，都不影响已产生的订单。</li>
        <li>{{ productTypeHint }}</li>
        <li>长度上限按类型默认（{{ defaultLengthHint }}）；最终以服务端下单时的校验为准。</li>
        <li>
          勾选<b>敏感</b>后，该字段在后台订单详情里默认打码（如 138****8000），
          需要带「查看敏感信息」权限点一次才显示明文，且这次查看会记进操作日志。
          手机号与邮箱类型建议勾选；身份证/银行卡这类填在文本框里的，服务端会按值自动兜底打码。
        </li>
      </ul>
    </el-alert>

    <!-- 常用字段：勾选即添加。刻意不做拖拽式设计器 —— 字段就那么几类，选比画快 -->
    <div class="form-fields-step__block">
      <div class="form-fields-step__title">常用字段（勾选即添加）</div>
      <div class="form-fields-step__presets">
        <el-checkbox
          v-for="preset in presets"
          :key="preset.key"
          :disabled="!!metaError"
          :model-value="isChecked(preset.key)"
          @change="(checked) => togglePreset(preset, checked)">
          {{ preset.label }}
          <span class="text-muted">{{ preset.typeLabel }}</span>
        </el-checkbox>
        <el-button plain icon="plus" :disabled="!!metaError || reachLimit" @click="addCustomRow">添加自定义字段</el-button>
      </div>
    </div>

    <!-- 已配置字段 -->
    <div class="form-fields-step__block">
      <div class="form-fields-step__title">
        已配置字段（{{ rows.length }} / {{ maxFieldCount }}）
        <span class="text-muted" style="font-size: 12px; font-weight: 400">列表顺序即前台下单页的填写顺序</span>
      </div>
      <el-empty v-if="!rows.length" description="未配置：买家下单时无需额外填写" :image-size="60" />
      <el-table v-else :data="rows" border size="small">
        <el-table-column label="顺序" width="112" align="center">
          <template #default="{ $index }">
            <el-button-group>
              <el-button size="small" icon="arrow-up" :disabled="$index === 0" @click="move($index, -1)" />
              <el-button size="small" icon="arrow-down" :disabled="$index === rows.length - 1" @click="move($index, 1)" />
            </el-button-group>
          </template>
        </el-table-column>
        <el-table-column label="字段键" width="170">
          <template #default="{ row }">
            <!-- 预设的键是「买家提交值 ↔ 订单快照」的匹配依据，改了等于换了个字段，故只读 -->
            <el-tooltip v-if="row.isPreset" content="键用于匹配买家提交的值与订单快照，创建后不要修改" placement="top">
              <el-tag size="small" effect="plain">{{ row.field }}</el-tag>
            </el-tooltip>
            <el-input v-else v-model="row.field" placeholder="字母开头，如 receiverAccount" @input="commit" />
          </template>
        </el-table-column>
        <el-table-column label="标题" width="170">
          <template #default="{ row }">
            <el-input v-model="row.label" maxlength="50" placeholder="给买家看的名称" @input="commit" />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="140">
          <template #default="{ row }">
            <el-select v-model="row.type" class="w100" @change="onTypeChange(row)">
              <el-option v-for="type in types" :key="type.value" :label="type.label" :value="type.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="必填" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.required" @change="commit" />
          </template>
        </el-table-column>
        <el-table-column label="候选项" min-width="200">
          <template #default="{ row }">
            <!-- 选择型字段没有候选项，服务端保存时会直接拒绝，这里就地提示 -->
            <el-input
              v-if="needOptions(row.type)"
              v-model="row.options"
              placeholder="逗号分隔，如：1个月,3个月,12个月"
              @input="commit" />
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="占位提示" width="180">
          <template #default="{ row }">
            <el-input v-model="row.placeholder" maxlength="50" placeholder="选填" @input="commit" />
          </template>
        </el-table-column>
        <el-table-column label="敏感" width="92" align="center">
          <template #default="{ row }">
            <!-- 类型建议敏感、但当前没勾时给一个提示：不勾也能用，只是后台详情里会保持明文 -->
            <el-tooltip :content="sensitiveTip(row)" placement="top">
              <span>
                <el-switch v-model="row.sensitive" @change="onSensitiveToggle(row)" />
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button type="danger" link icon="delete" @click="removeRow($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup name="FormFieldsStep">
import { getProductFormMeta } from '@/api/shopping/product'

const props = defineProps({
  // 商品主表数据（只读，用来判断形态给提示）
  info: {
    type: Object,
    default: null
  },
  // 下单表单字段定义（ProductDto.formItems）。null = 库里尚未配置。
  // 刻意保留 null 语义：服务端对「未提交(null)」是"保留原配置"，若这里归一成空数组回传，
  // 会把别人用接口/脚本配好的字段在保存商品时静默清空。故只在买家真正改动后才回写。
  items: {
    type: Array,
    default: null
  }
})
const emit = defineEmits(['update:items'])

const loading = ref(false)
const metaError = ref(false)
const presets = ref([])
const types = ref([])
const maxFieldCount = ref(20)

// 表格行 = 字段定义 + isPreset（预设的键只读、可整体取消勾选）
const rows = ref([])
// 最近一次回写给父组件的内容：props 变化若与它一致，说明是我自己刚写出去的，跳过重建 ——
// 否则每敲一个字都会重建表格，输入框会丢焦点。
let lastEmitted = ''

const presetKeys = computed(() => new Set(presets.value.map((item) => item.key)))
const reachLimit = computed(() => rows.value.length >= maxFieldCount.value)

const productTypeHint = computed(() =>
  Number(props.info?.productType) === 2
    ? '虚拟商品常配「接收账号 / 接收手机号」；实物商品也能用（如预约配送时间）。'
    : '实物商品可用来收集预约配送时间、下单备注等；虚拟商品常配「接收账号 / 接收手机号」。'
)
const defaultLengthHint = computed(() => {
  const text = types.value.find((item) => item.value === 'text')?.defaultMaxLength ?? 200
  const textarea = types.value.find((item) => item.value === 'textarea')?.defaultMaxLength ?? 1000
  return `单行 ${text} / 多行 ${textarea} 字`
})

// 类型是否需要候选项：以服务端下发的 types 为准，前端不自己维护一份类型表
function needOptions(type) {
  return !!types.value.find((item) => item.value === type)?.needOptions
}

/**
 * 该类型是否「建议」标敏感（手机号/邮箱）。同样取自服务端下发的 types，不在前端硬编码。
 * 与后端 ProductFormType.DefaultSensitive 同一口径。
 */
function defaultSensitive(type) {
  return !!types.value.find((item) => item.value === type)?.defaultSensitive
}

/**
 * 敏感开关的提示文案：
 * - 类型建议敏感却没勾 → 提醒（不强制，运营自己决定）
 * - 已勾 → 说明勾了会发生什么
 * - 其余 → 默认说明
 */
function sensitiveTip(row) {
  if (row.sensitive) {
    return '已标记为敏感：后台订单详情里默认打码，需「查看敏感信息」权限才能看明文'
  }
  if (defaultSensitive(row.type)) {
    return '该类型（手机号/邮箱）建议勾选敏感；不勾则后台订单详情里直接显示明文'
  }
  return '勾选后后台订单详情里该字段默认打码。身份证/银行卡格式的文本值服务端会自动打码'
}

function isChecked(key) {
  return rows.value.some((row) => row.field === key)
}

/** 后端元数据：预设字段、类型词表与各项限制（纯常量接口，不查库） */
async function loadMeta() {
  loading.value = true
  metaError.value = false
  try {
    const res = await getProductFormMeta()
    presets.value = res.data?.presets || []
    types.value = res.data?.types || []
    maxFieldCount.value = res.data?.maxFieldCount || 20
    // 预设是异步到的，早于它重建的行会把已配置的预设字段误标成「自定义」，
    // 这里就地刷一次标记（不重建，避免丢掉用户已经改到一半的内容）
    rows.value.forEach((row) => {
      row.isPreset = presetKeys.value.has(row.field)
    })
  } catch (error) {
    // 业务/网络错误由 request 拦截器统一提示，这里只标记"没拿到"，由面板给出重试
    console.error('[FormFieldsStep] 加载下单表单元数据失败', error)
    metaError.value = true
  } finally {
    loading.value = false
  }
}

/** 由 props 重建表格：只在外部（回显/重置/草稿恢复）真正换了内容时执行 */
function syncFromProps(value) {
  rows.value = (value || []).map((item) => {
    const type = item.type || 'text'
    return {
      field: item.field || '',
      label: item.label || '',
      type,
      required: !!item.required,
      options: item.options || '',
      pattern: item.pattern || '',
      maxLength: item.maxLength ?? null,
      placeholder: item.placeholder || '',
      sensitive: !!item.sensitive,
      isPreset: presetKeys.value.has(item.field)
    }
  })
  lastEmitted = JSON.stringify(value || [])
}

/**
 * 回写父组件。sort 按当前行序生成 —— 顺序只由表格顺序决定，
 * 界面上没有第二处可改的排序值，避免出现"排了却没生效"。
 */
function commit() {
  const next = rows.value.map((row, index) => ({
    field: (row.field || '').trim(),
    label: (row.label || '').trim(),
    type: row.type,
    required: !!row.required,
    options: (row.options || '').trim(),
    pattern: (row.pattern || '').trim(),
    maxLength: row.maxLength || null,
    placeholder: (row.placeholder || '').trim(),
    sensitive: !!row.sensitive,
    // sensitiveTouched 只是界面内的"用户是否手动过"标记，不落配置
    sort: index
  }))
  lastEmitted = JSON.stringify(next)
  emit('update:items', next)
}

function togglePreset(preset, checked) {
  if (checked) {
    if (reachLimit.value) return
    rows.value.push({
      field: preset.key,
      label: preset.label,
      type: preset.type,
      required: !!preset.required,
      options: '',
      pattern: '',
      maxLength: null,
      placeholder: preset.placeholder || '',
      // 预设的服务端默认值（如「接收手机号」是敏感的，「接收账号」不是）
      sensitive: preset.defaultSensitive ?? defaultSensitive(preset.type),
      isPreset: true
    })
  } else {
    rows.value = rows.value.filter((row) => row.field !== preset.key)
  }
  commit()
}

/** 自定义字段：给个不冲突的初始键，省得"一点就报字段键未填" */
function addCustomRow() {
  if (reachLimit.value) return
  const used = new Set(rows.value.map((row) => row.field))
  let seq = 1
  while (used.has(`custom${seq}`)) seq++
  rows.value.push({
    field: `custom${seq}`,
    label: '',
    type: 'text',
    required: false,
    options: '',
    pattern: '',
    maxLength: null,
    placeholder: '',
    sensitive: defaultSensitive('text'),
    isPreset: false
  })
  commit()
}

function removeRow(index) {
  rows.value.splice(index, 1)
  commit()
}

/**
 * 切换类型时把「敏感」跟随到新类型的默认值。
 *
 * 只在该行从未被手动改过时跟随（!row.sensitiveTouched）：一旦运营自己点过开关，
 * 他的取舍就该被尊重，不能下次改类型又被系统覆盖回去。
 */
function onTypeChange(row) {
  if (!row.sensitiveTouched) {
    row.sensitive = defaultSensitive(row.type)
  }
  commit()
}

/** 手动点过敏感开关：之后改类型不再自动覆盖运营的取舍 */
function onSensitiveToggle(row) {
  row.sensitiveTouched = true
  commit()
}

function move(index, delta) {
  const target = index + delta
  if (target < 0 || target >= rows.value.length) return
  const list = rows.value
  ;[list[index], list[target]] = [list[target], list[index]]
  commit()
}

watch(
  () => props.items,
  (value) => {
    if (JSON.stringify(value || []) === lastEmitted) return
    syncFromProps(value)
  },
  { immediate: true, deep: true }
)

onMounted(loadMeta)
</script>

<style scoped lang="scss">
.form-fields-step__list {
  margin: 4px 0 0;
  padding-left: 18px;
  line-height: 1.8;
}
.form-fields-step__block {
  margin-bottom: 16px;
}
.form-fields-step__title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}
.form-fields-step__presets {
  display: flex;
  align-items: center;
  gap: 0 16px;
  flex-wrap: wrap;
}
</style>