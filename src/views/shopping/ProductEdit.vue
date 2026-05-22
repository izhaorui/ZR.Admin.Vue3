<template>
  <div>
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane label="基本信息" name="base">
        <BaseForm
          ref="basicInfo"
          :oper-type="opertype"
          :info="form.data"
          :category-options="categoryOptions"
          :sale-status-options="dictStore.saleStatusOptions"></BaseForm>
      </el-tab-pane>
      <el-tab-pane label="价格/库存" name="sku">
        <el-form-item label="规格类型" label-width="110px" label-position="left">
          <el-radio-group v-model="form.data.specType" @change="handleSelectSpec">
            <el-radio :value="1">单规格</el-radio>
            <el-radio :value="2">多规格</el-radio>
          </el-radio-group>

          <template v-if="form.data.specType == 2">
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link ml10 text-success">
                选择规格模板
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="item" v-for="item in specTplList">{{ item.templateName }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-form-item>
        <SpecForm
          ref="specFormRef"
          v-if="form.data.specType == 2"
          v-model:info="form.data"
          v-model:spec-list="form.specList"
          v-model:skus="form.skus"></SpecForm>
        <SingleSkuForm
          ref="singleSkuFormRef"
          v-if="form.data.specType == 1"
          v-model:info="form.data"
          v-model:spec-list="form.specList"
          v-model:skus="form.skus"></SingleSkuForm>
      </el-tab-pane>
      <el-tab-pane label="商品详情" name="detail">
        <el-form-item label="商品详情" label-width="70px">
          <el-row :gutter="10">
            <el-col :lg="16">
              <editor v-model="form.data.detailsHtml" style="width: 500px" :toolbarConfig="toolbarConfig" :min-height="196" />
            </el-col>

            <el-col :lg="8">
              <el-scrollbar height="400px">
                <div class="pre-wrap" v-html="form.data.detailsHtml"></div>
              </el-scrollbar>
            </el-col>
          </el-row>
        </el-form-item>
      </el-tab-pane>

      <el-tab-pane label="销售设置" name="sale">
        <OtherForm ref="otherFormRef" :info="form.data"></OtherForm>
      </el-tab-pane>
    </el-tabs>

    <el-row class="mt20 bt">
      <el-button type="success" icon="check" size="default" @click="handleSubmit" :loading="submitLoading">提交商品</el-button>
    </el-row>
  </div>
</template>

<script setup>
import { addShoppingProduct, getShoppingProduct, updateShoppingProduct } from '@/api/shopping/product'
import { listSpecTemplate } from '@/api/shopping/spectemplate'
import { treelistCategory } from '@/api/shopping/category.js'
import useDictStore from '@/store/modules/dict'
import { ElMessage } from 'element-plus'

// 富文本组件
import Editor from '@/components/Editor'
import BaseForm from './components/BaseForm.vue'
import SpecForm from './components/SpecForm.vue'
import SingleSkuForm from './components/SingleSkuForm.vue'
import OtherForm from './components/OtherForm.vue'
const dictStore = useDictStore()
const { proxy } = getCurrentInstance()

const toolbarConfig = ref({
  toolbarKeys: [
    // 菜单 key
    // 'headerSelect',
    'bold', // 加粗
    'italic', // 斜体
    'through', // 删除线
    'underline', // 下划线
    // 'bulletedList', // 无序列表
    // 'numberedList', // 有序列表
    'color', // 文字颜色
    'uploadImage', // 上传图片
    'uploadVideo', // 上传图片
    'delIndent', // 缩进
    'indent', // 增进
    'insertLink', // 插入链接
    'fontSize', // 字体大小
    'clearStyle', // 清除格式
    'divider', // 分割线
    // 'insertTable', // 插入表格
    'justifyCenter', // 居中对齐
    'justifyJustify', // 两端对齐
    'justifyLeft', // 左对齐
    'justifyRight', // 右对齐
    'emotion'
    // 'fullScreen' // 全屏
  ]
})
const route = useRoute()
const emits = defineEmits(['success'])

const form = reactive({
  data: {
    purchaseLimit: {
      limit: false
    }
  },
  skus: [],
  specList: []
})
const activeName = ref('base')
// 0,add 1,update
const opertype = ref(0)
const submitLoading = ref(false)
// 重置表单
function reset() {
  form.data = {
    productId: undefined,
    sortId: 200,
    saleStatus: 0,
    productName: undefined,
    introduce: '',
    imageUrls: '',
    detailsHtml: '',
    categoryId: undefined,
    brandId: undefined,
    mainImage: '',
    specType: 2, // 规格类型 1.单 2.多
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
  // form.skus = []
  proxy.resetForm('formRef')
}
const specFormRef = ref()
const singleSkuFormRef = ref()
const otherFormRef = ref()

function getFormPromise(form) {
  return new Promise((resolve) => {
    form.validate((res, invalidFields) => {
      resolve({
        isValid: res,
        invalidFields
      })
    })
  })
}

// 提交校验
function handleSubmit() {
  const basicForm = proxy.$refs.basicInfo?.$refs.basicInfoForm
  // const specFormRef = proxy.$refs.specFormRef?.$refs.specFormRef
  const singleSkuFormRef = proxy.$refs.singleSkuFormRef?.$refs.singleSkuFormRef
  const otherFormRef = proxy.$refs.otherFormRef?.$refs.formRef
  // 1. 动态收集当前启用的 form 表单
  const formList = [basicForm, otherFormRef]
  if (form.data.specType === 1 && singleSkuFormRef) {
    formList.push(singleSkuFormRef)
  }
  // else if (form.data.specType === 2 && specFormRef) {
  //   formList.push(specFormRef)
  // }
  Promise.all(formList.map(getFormPromise)).then((results) => {
    const validateResult = results.every((item) => item.isValid)
    if (!validateResult) {
      // 收集所有错误信息
      const allErrors = results.flatMap((item) => {
        if (!item.isValid && item.invalidFields) {
          return Object.values(item.invalidFields).flatMap((fieldArr) => fieldArr.map((err) => err.message))
        }
        return []
      })

      // 去重 + 合并错误信息
      // const errorMsg = [...new Set(allErrors)].join('；')
      const firstError = Object.values(allErrors)?.[0]
      if (allErrors.length > 0 && firstError) {
        ElMessage.error(firstError || '表单验证未通过')
      }
      return
    }

    if (form.data.specType === 1) {
      // 单规格模式下，自动填入一个默认规格（用于统一数据结构）
      form.specList = [{ name: '规格', values: ['默认'] }]
      for (const sku of form.skus) {
        sku.specs = [{ name: '规格', value: '默认' }]
      }
    }
    if (form.data.specType == 2) {
      // 多规格校验
      if (form.specList.length === 0) {
        activeName.value = 'sku'
        ElMessage.error('请在【价格库存】标签里面至少添加一个商品规格')
        return
      }
      for (const [i, spec] of form.specList.entries()) {
        if (!spec.name.trim()) {
          ElMessage.error(`第 ${i + 1} 个规格名称不能为空`)
          return
        }
        if (spec.values.length === 0) {
          ElMessage.error(`规格 "${spec.name}" 必须包含至少一个值`)
          return
        }
      }
    }

    // 校验 SKU
    if (form.skus.length === 0) {
      ElMessage.error('请生成 SKU 列表')
      return
    }

    for (const [i, sku] of form.skus.entries()) {
      if (sku.price <= 0) {
        ElMessage.error(`第 ${i + 1} 个 SKU 的价格必须大于 0`)
        return
      }
      if (sku.stock < 0) {
        ElMessage.error(`第 ${i + 1} 个 SKU 的库存不能为负数`)
        return
      }
    }

    const payload = {
      ...form.data,
      spec: form.specList,
      skus: form.skus.map((sku, index) => ({
        ...sku,
        sortId: index,
        productId: form.productId
      }))
    }
    submitLoading.value = true
    if (opertype.value == 0) {
      addShoppingProduct(payload)
        .then((res) => {
          ElMessage({ type: 'success', message: '添加成功', duration: 1500 })
          proxy.$modal.loading('跳转中...')
          handleClose(res.data)
        })
        .finally(() => {
          submitLoading.value = false
        })
    } else {
      updateShoppingProduct(payload)
        .then((res) => {
          ElMessage({ type: 'success', message: '修改成功', duration: 1500 })
          proxy.$modal.loading('跳转中...')
          handleClose(res.data)
        })
        .finally(() => {
          submitLoading.value = false
        })
    }
    // console.log('提交表单数据:', JSON.stringify(payload, null, 2))
  })
}

const categoryOptions = ref([])
treelistCategory({ showStatus: 1 }).then((res) => {
  categoryOptions.value = res.data
})

reset()
watch(
  () => route.query.id,
  (val) => {
    reset()
    if (val) {
      handleEdit(val)
    }
  },
  {
    immediate: true
  }
)

function handleEdit(id) {
  if (id) {
    getInfo(id)
  }
}

/**
 * 编辑回显数据
 * @param productId 商品id
 */
function getInfo(productId) {
  getShoppingProduct(productId).then((res) => {
    const { code, data } = res
    if (code == 200) {
      opertype.value = 1
      // 回显商品信息
      form.data = data
      form.specList.splice(0, form.specList.length, ...data.spec)
      // 回显 SKU
      form.skus = data.skus
    }
  })
}
function handleClose(info) {
  proxy.$tab
    .closeOpenPage({
      path: './product',
      query: { refresh: '1' }
    })
    .finally(() => {
      proxy.$modal.closeLoading()
    })
}
// 选择规格
function handleSelectSpec(val) {
  // form.specList.length = 0
  // form.skus.length = 0
}
const specTplList = ref([])
watch(
  () => form.data.specType,
  (val) => {
    if (val == 2) {
      listSpecTemplate().then((res) => {
        specTplList.value = res.data
      })
    }
  },
  {
    immediate: true
  }
)
function handleCommand(e) {
  form.specList = e.specJson
}
</script>

<style scoped lang="scss">
.mr-2 {
  margin-right: 8px;
}
.ml-2 {
  margin-left: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.el-card__header {
  padding: 10px;
}
.bt {
  display: flex;
  justify-content: center;
}
.pre-wrap {
  width: 300px;
  overflow: hidden;
  img {
    width: 100%;
    max-width: 100%;
    display: block;
  }
}
</style>
