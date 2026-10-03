<template>
  <div class="product-edit">
    <el-tabs v-model="activeName">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="base">
        <BaseForm
          ref="basicInfo"
          :oper-type="opertype"
          :info="form.data"
          :category-options="categoryOptions"
          :sale-status-options="dictStore.saleStatusOptions"></BaseForm>
      </el-tab-pane>

      <!-- 价格/库存 -->
      <el-tab-pane label="价格/库存" name="sku">
        <PriceStockStep ref="priceStock" :info="form.data" v-model:spec-list="form.specList" v-model:skus="form.skus" />
      </el-tab-pane>

      <!-- 商品详情 -->
      <el-tab-pane label="商品详情" name="detail">
        <el-form label-position="left" label-width="70px">
          <el-form-item label="商品详情">
            <div class="detail-editor">
              <!-- 详情内容仅在前台移动端展示，固定 500px 模拟移动端视口宽度，避免按桌面宽度排版产生错觉 -->
              <editor
                ref="detailEditorRef"
                v-model="form.data.detailsHtml"
                style="width: 500px"
                :toolbarConfig="toolbarConfig"
                height="420px" />
              <div class="detail-editor__actions">
                <el-button plain icon="picture" @click="openLibrary">从素材库选择图片</el-button>
                <span class="text-muted">支持多选，插入到光标位置；未定位过光标时追加到详情末尾</span>
              </div>
            </div>
          </el-form-item>
        </el-form>

        <!-- 复用素材库弹窗：容器隐藏即可，弹窗本身是 append-to-body 的 -->
        <div class="detail-picker">
          <ImageSelector
            :key="pickerSeq"
            ref="libraryPickerRef"
            :model-value="libraryPicked"
            :limit="9"
            :file-size="10"
            @update:model-value="handleLibraryPicked" />
        </div>
      </el-tab-pane>

      <!-- 预览：提交前的总检查 -->
      <el-tab-pane label="预览" name="preview">
        <SkuPreview
          :info="form.data"
          :spec-list="form.specList"
          :skus="form.skus"
          :issues="allIssues"
          :category-options="categoryOptions"
          :sale-status-options="dictStore.saleStatusOptions"
          @jump="activeName = $event" />
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作：贴在内容底部，滚动时保持可见 -->
    <div class="edit-footer">
      <div class="edit-footer__info">
        <el-tooltip v-if="draftEnabled" content="新增商品的草稿会自动保存在本机，下次新增时可恢复；提交成功后自动清除" placement="top">
          <span class="draft-chip" :class="{ 'is-saved': !!draftSavedAt }">
            <el-icon><Document /></el-icon>{{ draftSavedAt ? `草稿 ${draftSavedAt}` : '草稿未保存' }}
          </span>
        </el-tooltip>
        <el-button v-if="blockerIssues.length" type="danger" link size="small" @click="goFirstIssue">
          <el-icon><WarningFilled /></el-icon>还有 {{ blockerIssues.length }} 项待处理
        </el-button>
      </div>
      <div class="edit-footer__actions">
        <el-button v-if="draftEnabled" plain icon="document-add" @click="saveDraft(false)">保存草稿</el-button>
        <el-button type="success" :loading="submitLoading" @click="handleSubmit">提交商品</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { addShoppingProduct, getShoppingProduct, updateShoppingProduct } from '@/api/shopping/product'
import { treelistCategory } from '@/api/shopping/category.js'
import useDictStore from '@/store/modules/dict'
import { ElMessage, ElMessageBox } from 'element-plus'

// 富文本组件
import Editor from '@/components/Editor'
import BaseForm from './components/BaseForm.vue'
import PriceStockStep from './components/PriceStockStep.vue'
import SkuPreview from './components/SkuPreview.vue'
import { useProductIssues } from './composables/useProductIssues'
import { useProductDraft } from './composables/useProductDraft'

const dictStore = useDictStore()
const { proxy } = getCurrentInstance()
const route = useRoute()

const toolbarConfig = {
  toolbarKeys: [
    'bold', // 加粗
    'underline', // 下划线
    'color', // 文字颜色
    'uploadImage', // 上传图片
    'delIndent', // 缩进
    'indent', // 增进
    'fontSize', // 字体大小
    'clearStyle', // 清除格式
    'divider', // 分割线
    'insertTable', // 插入表格
    'justifyCenter', // 居中对齐
    'justifyJustify', // 两端对齐
    'justifyLeft', // 左对齐
    'justifyRight', // 右对齐
    'emotion'
  ]
}

const activeName = ref('base')
// 0,add 1,update
const opertype = ref(0)
const submitLoading = ref(false)
const categoryOptions = ref([])
const form = reactive({
  data: {
    purchaseLimit: {
      limit: false
    }
  },
  skus: [],
  specList: []
})

// 校验清单与本机草稿见同目录 composables，页面只负责流程编排
const { allIssues, blockerIssues } = useProductIssues(form)
const { draftEnabled, draftSavedAt, saveDraft, clearDraft, checkDraft, startTracking, resetTracking } = useProductDraft(form, route)

// 切到第一条待处理问题所在的标签页
function goFirstIssue() {
  activeName.value = blockerIssues.value[0]?.tab || 'base'
}

/** 售卖状态：在售（后端 SaleStatus.OnSale） */
const SALE_STATUS_ON_SALE = 1

/**
 * 「在售 + 价格过低」的二次确认文案；返回空串表示无需确认。
 *
 * 判据是**值本身**而不是"改动痕迹"：新增商品时价格框初始为 0，
 * 而它历史上的 :min 会把 0 静默钳制成 0.01（见 SingleSkuForm 的说明），
 * 两种情形都意味着"运营并没有真正定过价"，一旦上架前台就按这个价格售卖。
 *
 * 只在**在售**时提醒：下架商品可以安心先保存，之后从列表页批量上架，
 * 在这里拦它只会多一次无意义的点击。
 *
 * 阈值取 0.01：既是输入框允许的最小金额，也是"没定过价"最典型的表现。
 */
function onSaleLowPriceWarning() {
  if (Number(form.data.saleStatus) !== SALE_STATUS_ON_SALE) return ''
  const lowPrices = form.skus
    .map((sku) => Number(sku?.price || 0))
    .filter((price) => price <= 0.01)
  if (!lowPrices.length) return ''

  const detail = lowPrices.map((price) => `¥${price.toFixed(2)}`).join('、')
  return `该商品将按「在售」提交，但有 ${lowPrices.length} 个 SKU 的价格是 ${detail}，确认按这个价格上架？`
}

/*************** 商品详情：从素材库插入图片 ***************/
const detailEditorRef = ref()
const libraryPickerRef = ref()
const libraryPicked = ref('')
// ImageSelector 弹窗的初始选中取自组件内部状态，选完确认后会残留；
// 不改公共组件，这里在「选过之后下次打开」时换 key 重建实例回到干净状态
const pickerSeq = ref(0)
const pickerDirty = ref(false)

function openLibrary() {
  if (pickerDirty.value) {
    pickerDirty.value = false
    pickerSeq.value++
    // 重建实例后 ref 会指向新组件，等渲染完成再打开弹窗
    nextTick(() => libraryPickerRef.value?.openDialog())
    return
  }
  libraryPickerRef.value?.openDialog()
}

// 素材库确认后回传的是逗号分隔地址，插入编辑器后清空，便于再次勾选
function handleLibraryPicked(value) {
  const urls = String(value || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
  if (urls.length) {
    detailEditorRef.value?.insertImages(urls)
    ElMessage.success(`已插入 ${urls.length} 张图片`)
  }
  libraryPicked.value = ''
  // 标记已选过，下次打开前重建选择器实例
  pickerDirty.value = true
}

function getFormPromise(form) {
  return new Promise((resolve) => {
    form.validate((isValid, invalidFields) => resolve({ isValid, invalidFields }))
  })
}

// 提交：先跑表单规则（基本信息 + 价格库存），再看问题清单；哪一栏有问题就切到哪一栏
async function handleSubmit() {
  const checks = []
  const basicForm = proxy.$refs.basicInfo?.$refs?.basicInfoForm
  if (basicForm) checks.push({ tab: 'base', task: getFormPromise(basicForm) })
  if (proxy.$refs.priceStock) checks.push({ tab: 'sku', task: proxy.$refs.priceStock.validate() })

  const results = await Promise.all(checks.map((item) => item.task))
  const invalidIndex = results.findIndex((item) => !item.isValid)
  if (invalidIndex > -1) {
    activeName.value = checks[invalidIndex].tab
    const invalidFields = results[invalidIndex].invalidFields || {}
    ElMessage.error(Object.values(invalidFields)?.[0]?.[0]?.message || '表单校验未通过，请检查必填项')
    return
  }

  const blocker = blockerIssues.value[0]
  if (blocker) {
    activeName.value = blocker.tab
    ElMessage.error(blocker.text)
    return
  }

  // 在售 + 价格过低：提交前二次确认。校验清单拦不住这种"值合法但没定过价"的情况，
  // 而它一旦上架就是实打实的错误售价，故用一次确认兜住。
  const priceWarning = onSaleLowPriceWarning()
  if (priceWarning) {
    try {
      await ElMessageBox.confirm(priceWarning, '确认上架价格', {
        confirmButtonText: '确认提交',
        cancelButtonText: '返回改价',
        type: 'warning'
      })
    } catch (error) {
      // 取消不是错误：直接切到价格页签，让运营就地改价，而不是只丢一句提示
      activeName.value = 'sku'
      return
    }
  }

  const payload = {
    ...form.data,
    spec: form.specList,
    skus: form.skus.map((sku, index) => ({ ...sku, sortId: index }))
  }
  submitLoading.value = true
  try {
    const res = opertype.value == 0 ? await addShoppingProduct(payload) : await updateShoppingProduct(payload)
    ElMessage({ type: 'success', message: opertype.value == 0 ? '添加成功' : '修改成功', duration: 1500 })
    clearDraft()
    proxy.$modal.loading('跳转中...')
    handleClose(res.data)
  } catch (error) {
    // 业务/网络错误由 request 拦截器统一提示，此处不重复弹错
    console.error('[ProductEdit] 提交商品失败', error)
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
function reset() {
  form.data = {
    productId: undefined,
    sortId: 200,
    saleStatus: 0,
    specType: 1,
    productName: undefined,
    introduce: '',
    imageUrls: '',
    detailsHtml: '',
    categoryId: undefined,
    brandId: undefined,
    mainImage: '',
    purchaseLimit: {
      limit: false,
      totalLimit: 0,
      singleLimit: 0
    }
  }
  activeName.value = 'base'
  opertype.value = 0
  form.specList.length = 0
  form.skus.length = 0
}

/**
 * 编辑回显数据
 * @param productId 商品id
 */
function getInfo(productId) {
  return getShoppingProduct(productId).then((res) => {
    const { code, data } = res
    if (code == 200) {
      opertype.value = 1
      // 回显商品信息
      form.data = data
      form.data.purchaseLimit = data.purchaseLimit || { limit: false, totalLimit: 0, singleLimit: 0 }
      form.specList.splice(0, form.specList.length, ...data.spec)
      // 回显 SKU
      form.skus = data.skus
    }
  })
}

function handleClose() {
  proxy.$tab
    .closeOpenPage({
      path: './product',
      query: { refresh: '1' }
    })
    .finally(() => {
      proxy.$modal.closeLoading()
    })
}

treelistCategory({ showStatus: 1 }).then((res) => {
  categoryOptions.value = res.data
})

reset()

watch(
  () => route.query.id,
  async (val) => {
    reset()
    // 加载期间不写草稿，否则会用空表单覆盖上一次的草稿
    resetTracking()
    if (val) {
      await getInfo(val)
    }
    await checkDraft()
    // 以加载完成后的内容为基线，之后只有真正改动才会自动存草稿
    startTracking()
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="scss">
.detail-editor {
  width: 100%;
}
.detail-editor__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 12px;
}
// 素材库选择器只借用它的弹窗，缩略图区域不需要显示
.detail-picker {
  display: none;
}
.edit-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding: 12px 0 8px;
  // 不做边框/阴影卡片：只用一层很淡的渐变把滚动的内容与按钮隔开，
  // 左侧没内容时也不会出现一条空荡荡的浮层
  background: linear-gradient(to top, var(--el-bg-color, #fff) 70%, transparent);
}
.edit-footer__info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
}
.draft-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  cursor: default;
  &.is-saved {
    background: var(--el-color-success-light-9, #f0f9eb);
    color: var(--el-color-success);
  }
}
.edit-footer__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
</style>
