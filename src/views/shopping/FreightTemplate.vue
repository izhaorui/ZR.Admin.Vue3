<!--
 * @Descripttion: 运费模板（mms_freight_template）
 *
 * 计费方式两选一（按件 / 按重），表单按 chargeType 动态显隐对应参数：
 * 另两组参数保留在表单里但不提交后端会被忽略，运营切换计费方式时不必重填。
 * 不配送地区用「多选 + checkStrictly」级联：允许只选省、只选市，或一路选到区。
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable />
      </el-form-item>
      <el-form-item label="计费方式" prop="chargeType">
        <el-select v-model="queryParams.chargeType" placeholder="全部" clearable style="width: 140px">
          <el-option label="按件" :value="1" />
          <el-option label="按重" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['shop:freight:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" :disabled="multiple" v-hasPermi="['shop:freight:delete']" plain icon="delete" @click="handleDelete">
          {{ $t('btn.delete') }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="refresh" @click="getList">刷新</el-button>
      </el-col>
    </el-row>

    <el-table
      :data="dataList"
      v-loading="loading"
      border
      header-cell-class-name="el-table-header-cell"
      highlight-current-row
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column prop="id" label="Id" align="center" width="80" />
      <el-table-column prop="templateName" label="模板名称" min-width="150" align="center" />
      <el-table-column label="计费方式" align="center" width="90">
        <template #default="{ row }">
          <el-tag :type="row.chargeType === 2 ? 'warning' : 'primary'" effect="light">
            {{ row.chargeType === 2 ? '按重' : '按件' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="首件/首重" align="center" width="100">
        <template #default="{ row }">
          {{ row.chargeType === 2 ? row.firstWeight + ' kg' : row.firstPiece + ' 件' }}
        </template>
      </el-table-column>
      <el-table-column label="续件/续重" align="center" width="100">
        <template #default="{ row }">
          {{ row.chargeType === 2 ? row.addWeight + ' kg' : row.addPiece + ' 件' }}
        </template>
      </el-table-column>
      <el-table-column prop="freight" label="运费(元)" align="center" width="90" />
      <el-table-column label="包邮门槛" align="center" width="100">
        <template #default="{ row }">
          <span v-if="row.freeShippingThreshold > 0">满 {{ row.freeShippingThreshold }} 元包邮</span>
          <span v-else class="text-secondary">不包邮</span>
        </template>
      </el-table-column>
      <el-table-column label="默认" align="center" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.isDefault === 1" type="success" effect="dark">默认</el-tag>
          <span v-else class="text-secondary">-</span>
        </template>
      </el-table-column>
      <el-table-column label="已绑商品" align="center" width="90">
        <template #default="{ row }">
          <span v-if="row.productCount > 0">{{ row.productCount }}</span>
          <span v-else class="text-secondary">0</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="scope">
          <el-button type="success" size="small" icon="edit" title="编辑" v-hasPermi="['shop:freight:edit']" @click="handleUpdate(scope.row)"></el-button>
          <el-button type="danger" size="small" icon="delete" title="删除" v-hasPermi="['shop:freight:delete']" @click="handleDelete(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="760px" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px">
        <el-divider content-position="left">基础</el-divider>
        <el-form-item label="模板名称" prop="templateName">
          <el-input v-model="form.templateName" placeholder="如：服饰类全国包邮" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
          <span class="tip-text">未绑定模板的商品按此模板计费；一个模板只允许一个默认</span>
        </el-form-item>

        <el-divider content-position="left">计费规则</el-divider>
        <el-form-item label="计费方式" prop="chargeType">
          <el-radio-group v-model="form.chargeType">
            <el-radio :value="1">按件</el-radio>
            <el-radio :value="2">按重（千克）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.chargeType === 1" label="首件" prop="firstPiece">
          <el-input-number v-model="form.firstPiece" :min="0" :precision="0" controls-position="right" />
          <span class="tip-text">该件数以内只收一份运费</span>
        </el-form-item>
        <el-form-item v-if="form.chargeType === 1" label="续件" prop="addPiece">
          <el-input-number v-model="form.addPiece" :min="1" :precision="0" controls-position="right" />
          <span class="tip-text">超出首件后，每满该件数加收一份运费</span>
        </el-form-item>
        <el-form-item v-if="form.chargeType === 2" label="首重(kg)" prop="firstWeight">
          <el-input-number v-model="form.firstWeight" :min="0" :precision="3" :step="0.5" controls-position="right" />
          <span class="tip-text">该重量以内只收一份运费</span>
        </el-form-item>
        <el-form-item v-if="form.chargeType === 2" label="续重(kg)" prop="addWeight">
          <el-input-number v-model="form.addWeight" :min="0.001" :precision="3" :step="0.5" controls-position="right" />
          <span class="tip-text">超出首重后，每满该重量加收一份运费</span>
        </el-form-item>
        <el-form-item label="运费(元)" prop="freight">
          <el-input-number v-model="form.freight" :min="0" :precision="2" controls-position="right" />
          <span class="tip-text">首件/首重那一份的金额，续件/续重每单位也加收这么多</span>
        </el-form-item>
        <el-form-item label="包邮门槛" prop="freeShippingThreshold">
          <el-input-number v-model="form.freeShippingThreshold" :min="0" :precision="2" controls-position="right" />
          <span class="tip-text">商品总额达到该值时本模板免运费；填 0 表示不包邮</span>
        </el-form-item>

        <el-divider content-position="left">不配送地区</el-divider>
        <el-form-item label="排除地区">
          <el-cascader
            v-model="cascaderValue"
            :options="areaOptions"
            :props="cascaderProps"
            clearable
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="留空表示全国均可配送"
            style="width: 100%" />
          <div class="tip-text">
            可只选省、只选市，或一路选到区；收货地命中任一排除地区时将直接阻止下单并提示地区名
          </div>
        </el-form-item>
        <el-form-item label="已选地区">
          <div v-if="selectedRegions.length === 0" class="text-secondary">未设置，全部地区均可配送</div>
          <el-tag v-for="r in selectedRegions" :key="r.areaCode" closable class="mr-1" @close="removeRegion(r)">
            {{ r.areaName }}<span v-if="r.level < 3" class="tag-hint">（{{ levelText(r.level) }}）</span>
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="FreightTemplate">
import { ElMessage } from 'element-plus'
import { getAreaTree } from '@/api/shopping/area'
import {
  addFreightTemplate,
  delFreightTemplate,
  getFreightTemplate,
  listFreightTemplate,
  updateFreightTemplate
} from '@/api/shopping/freightTemplate'

const { proxy } = getCurrentInstance()

/** 计费方式：1 按件 / 2 按重（与后端 FreightChargeTypeEnum 一致） */
const CHARGE_BY_PIECE = 1
const CHARGE_BY_WEIGHT = 2

const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const submitLoading = ref(false)
const open = ref(false)
const title = ref('')
const dataList = ref([])
const total = ref(0)
const single = ref(true)
const multiple = ref(true)
const queryRef = ref()
const formRef = ref()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  templateName: undefined,
  chargeType: undefined
})

/** 表单初值：一次填全，避免切换计费方式时读到 undefined */
const defaultForm = () => ({
  id: null,
  templateName: '',
  chargeType: CHARGE_BY_PIECE,
  firstPiece: 1,
  addPiece: 1,
  firstWeight: 1,
  addWeight: 1,
  freight: 0,
  freeShippingThreshold: 0,
  isDefault: 0,
  excludeRegions: []
})

const form = ref(defaultForm())

const rules = {
  templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  chargeType: [{ required: true, message: '请选择计费方式', trigger: 'change' }],
  freight: [{ required: true, message: '运费不能为空', trigger: 'blur' }],
  // 续件/续重为 0 会让后端无法按单位切分计费，服务层也会直接拒绝，这里提前拦
  addPiece: [
    {
      validator: (rule, value, callback) => {
        if (form.value.chargeType === CHARGE_BY_PIECE && (!value || value < 1)) {
          callback(new Error('续件必须大于等于 1'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  addWeight: [
    {
      validator: (rule, value, callback) => {
        if (form.value.chargeType === CHARGE_BY_WEIGHT && (!value || value <= 0)) {
          callback(new Error('续重必须大于 0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

/* ---------------- 地区级联（不配送地区） ---------------- */

/**
 * 地区选项：懒加载下级。
 * 一次性拉全量（约 3400 条）会让首屏变慢，而运营通常只配到市/区级，
 * 故按 parentId 逐级拉，用户展开哪级才请求哪级。
 */
const areaOptions = ref([])
const cascaderValue = ref([])
/** checkStrictly：允许只选省或只选市，不必一路选到区县 */
const cascaderProps = { multiple: true, checkStrictly: true, emitPath: true }

const LEVEL_PROVINCE = 1
const LEVEL_CITY = 2

const levelText = (level) => ({ [LEVEL_PROVINCE]: '全省', [LEVEL_CITY]: '全市' })[level] || ''

/** 拉取省级并写入级联选项（打开弹窗时调一次） */
async function loadProvinces() {
  const res = await getAreaTree(0)
  if (res.code === 200) {
    areaOptions.value = (res.data || []).map(toCascaderNode)
  }
}

function toCascaderNode(area) {
  const node = { value: area.areaCode, label: area.name, level: area.level }
  if (area.hasChildren) {
    // children 先留空数组：el-cascader 见到空数组才会认为"有子级但未加载"从而触发 lazyLoad
    node.children = []
    node.lazyLoad = (resolve) => loadChildren(area.id, resolve)
  }
  return node
}

function loadChildren(parentId, resolve) {
  getAreaTree(parentId).then((res) => {
    if (res.code === 200) {
      resolve((res.data || []).map(toCascaderNode))
    } else {
      resolve([])
    }
  })
}

/** 已选地区：级联值是 code 路径数组，这里回显成带名称与层级的对象列表 */
const selectedRegions = computed(() =>
  cascaderValue.value
    .map((path) => {
      const areaCode = path[path.length - 1]
      // 逐级回溯找名称：el-cascader 的节点里带 label，直接从末尾节点取
      let label = areaCode
      let level = 1
      findLabel(areaOptions.value, areaCode, (found, lv) => {
        label = found
        level = lv
      })
      return { areaCode, areaName: label, level }
    })
    .filter((r) => r.areaName)
)

/** 在级联选项里递归找 code 对应节点的名称与层级 */
function findLabel(nodes, code, hit) {
  for (const n of nodes || []) {
    if (n.value === code) {
      hit(n.label, n.level)
      return true
    }
    if (n.children && n.children.length) {
      if (findLabel(n.children, code, hit)) return true
    }
  }
  return false
}

function removeRegion(region) {
  cascaderValue.value = cascaderValue.value.filter((p) => p[p.length - 1] !== region.areaCode)
}

/* ---------------- 列表 ---------------- */

function getList() {
  loading.value = true
  listFreightTemplate(queryParams)
    .then((res) => {
      const { code, data } = res
      if (code === 200) {
        dataList.value = data.result
        total.value = data.totalNum
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/* ---------------- 表单 ---------------- */

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = defaultForm()
  cascaderValue.value = []
  submitLoading.value = false
  proxy.resetForm('formRef')
}

function handleAdd() {
  reset()
  open.value = true
  title.value = '新增运费模板'
  loadProvinces()
}

function handleUpdate(row) {
  reset()
  getFreightTemplate(row.id).then((res) => {
    const { code, data } = res
    if (code === 200) {
      form.value = { ...defaultForm(), ...data }
      // 详情返回的是 [{areaCode, areaName, level}]，级联要的是 code 路径
      cascaderValue.value = (data.excludeRegions || []).map((r) => [r.areaCode])
      open.value = true
      title.value = '修改运费模板'
      loadProvinces()
    }
  })
}

function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (!valid) return

    const payload = {
      ...form.value,
      excludeRegions: selectedRegions.value
    }
    submitLoading.value = true

    const req = form.value.id ? updateFreightTemplate(payload) : addFreightTemplate(payload)
    req
      .then(() => {
        proxy.$modal.msgSuccess(form.value.id ? '修改成功' : '新增成功')
        open.value = false
        getList()
      })
      .finally(() => {
        submitLoading.value = false
      })
  })
}

function handleDelete(row) {
  const Ids = row.id || ids.value
  proxy
    .$confirm('是否确认删除所选运费模板？删除后已绑定该模板的商品将改为按默认模板计费。', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(() => delFreightTemplate(Ids))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

getList()
</script>

<style scoped>
.tip-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
.text-secondary {
  color: #909399;
}
.mr-1 {
  margin-right: 4px;
}
.tag-hint {
  color: #909399;
  font-size: 12px;
}
</style>
