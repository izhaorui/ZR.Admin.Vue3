<template>
  <el-form ref="basicInfoForm" :model="info" :rules="rules" label-width="100px">
    <el-row :gutter="10">
      <el-col :lg="18">
        <el-row :gutter="10">
          <el-col :lg="12">
            <el-form-item label="商品名称" prop="productName">
              <el-input v-model="info.productName" show-word-limit :maxlength="64" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <BrandSelect v-model="info.brandId" />
          </el-col>

          <el-col :lg="12">
            <!-- 商品形态：决定要不要收货地址、计不计运费、付款后是否直接完成、买家能不能申请售后 -->
            <el-form-item label="商品类型">
              <!-- 只有两个取值，radio 比下拉少一次点击；v-model 直接绑数字，没有取值形态问题 -->
              <el-radio-group v-model="info.productType">
                <el-radio :value="1">实物</el-radio>
                <el-radio :value="2">虚拟（服务类）</el-radio>
              </el-radio-group>
              <div v-if="isVirtual" class="save-tip">
                <el-icon><InfoFilled /></el-icon>
                虚拟商品不计运费、下单不需收货地址、付款后订单直接完成、买家不能申请售后（运营仍可从订单页退款）。
                <b>改动只影响之后的下单，历史订单保持原形态。</b>
              </div>
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <!-- 运费模板：不选即走默认模板 / 计 0 运费，clearable 是合法配置。
                 虚拟商品不计运费，故置灰 —— 留着可点会让人以为能配 -->
            <el-form-item label="运费模板">
              <FreightTemplateSelect v-model="info.freightTemplateId" :disabled="isVirtual" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="分类">
              <!-- 分类是树形数据，用下拉而不是平铺 radio：不占版面，且选中的是完整层级路径。
                   emitPath: false 保证 v-model 拿到标量 categoryId（与后端 Product.CategoryId 同口径），
                   checkStrictly 让父级与子级都能选。 -->
              <el-cascader
                class="w100"
                :options="categoryOptions"
                :props="{ checkStrictly: true, value: 'categoryId', label: 'name', emitPath: false }"
                placeholder="请选择上级分类"
                clearable
                v-model="info.categoryId">
                <template #default="{ node, data }">
                  <span>{{ data.name }}</span>
                  <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
                </template>
              </el-cascader>
              <!-- 分类筛选是**精确匹配**（ProductService.QueryExp：CategoryId == 入参，不含子分类），
                   而这里父级可选 —— 商品挂在父分类上时，前台按它的子分类筛不出来。
                   提示写在字段上，免得又变成一次"分类好像没生效"的排查。 -->
              <div class="save-tip">
                <el-icon><InfoFilled /></el-icon>
                前台按分类筛选是精确匹配、不含子分类：商品请选到末级分类。
              </div>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="售卖状态" prop="saleStatus">
              <el-radio-group v-model="info.saleStatus">
                <el-radio-button v-for="item in saleStatusOptions" :key="item.dictValue" :value="parseInt(item.dictValue)">
                  {{ item.dictLabel }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="8">
            <el-form-item label="排序" prop="sortId">
              <template #label>
                <span>
                  <el-tooltip content="数字越大排序越靠前" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  排序
                </span>
              </template>
              <el-input-number type="text" v-model="info.sortId" />
            </el-form-item>
          </el-col>
          <el-col :lg="8">
            <el-form-item label="原价" prop="originalPrice">
              <template #label>
                <span>
                  <el-tooltip content="前端页面显示划线价格" placement="top">
                    <el-icon :size="15">
                      <questionFilled />
                    </el-icon>
                  </el-tooltip>
                  原价
                </span>
              </template>
              <el-input-number type="number" placeholder="请输入商品原价" :min="0" v-model="info.originalPrice" />
            </el-form-item>
          </el-col>
          <el-col :lg="8">
            <el-form-item label="单位" prop="unit">
              <el-input type="text" show-word-limit style="width: 190px" :maxlength="5" placeholder="请输入单位" v-model="info.unit">
                <template #append>
                  <el-select style="width: 70px" v-model="info.unit">
                    <el-option value="位">位</el-option>
                    <el-option value="米">米</el-option>
                    <el-option value="千克">千克</el-option>
                    <el-option value="升">升</el-option>
                    <el-option value="匹">匹</el-option>
                    <el-option value="盏">盏</el-option>
                    <el-option value="扇">扇</el-option>
                    <el-option value="幅">幅</el-option>
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="商品编码" prop="productCode">
              <el-input type="text" v-model="info.productCode" style="width: 200px" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="商品卖点" prop="introduce">
              <el-input type="textarea" show-word-limit :maxlength="200" v-model="info.introduce" placeholder="请输入商品卖点" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="商品主图" prop="mainImage">
              <UploadImage v-model="info.mainImage" :limit="1"></UploadImage>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="轮播图片" prop="imageUrls">
              <UploadImage v-model="info.imageUrls" :limit="8"></UploadImage>
            </el-form-item>
          </el-col>
        </el-row>
      </el-col>
      <el-col :lg="6">
        <el-form-item label="价格区间">
          <template #label>
            <span>
              <el-tooltip content="修改数据时根据sku价格自动计算获得" placement="top">
                <el-icon :size="15">
                  <questionFilled />
                </el-icon>
              </el-tooltip>
              价格区间
            </span>
          </template>

          {{ formatMoneyRange(info.price, info.maxPrice) }}
        </el-form-item>
        <el-form-item label="规格"> {{ info.specSummary || '-' }} </el-form-item>
        <el-form-item label="库存">
          {{ info.stock || '-' }}
        </el-form-item>
      </el-col>
      <el-col :lg="24">
        <el-form-item v-if="operType == 1">
          <el-button icon="check" type="primary" plain :loading="saving" @click="handleSubmitInfo">仅保存基础信息</el-button>
          <div class="save-tip">
            <el-icon><InfoFilled /></el-icon>
            只保存本页的商品名称、分类、图片、售卖状态等字段，<b>不含价格、库存、SKU 与商品详情</b>；完整保存请用底部的「提交商品」。
          </div>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script setup name="BasicInfoForm">
import { updateInfo } from '@/api/shopping/product'
import { ElMessage } from 'element-plus'
import { formatMoneyRange } from '@/utils/money'
import BrandSelect from './BrandSelect.vue'
import FreightTemplateSelect from './FreightTemplateSelect.vue'
const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  saleStatusOptions: {
    type: Array,
    default: []
  },
  categoryOptions: {
    type: Array,
    default: []
  },
  operType: {
    type: Number
  }
})

/** 商品形态（与后端 ProductTypeEnum 逐值对应） */
const PRODUCT_TYPE_VIRTUAL = 2

/**
 * 是否虚拟商品。
 *
 * 只用来置灰运费模板下拉并给出约束说明 —— 真正的行为判定全在服务端
 *（下单免地址、免运费、付款即完成、买家不可售后），前端不做业务判断。
 */
const isVirtual = computed(() => Number(props.info?.productType || 0) === PRODUCT_TYPE_VIRTUAL)

const rules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  introduce: [{ required: false, message: '请输入商品描述', trigger: 'blur' }],
  saleStatus: [{ required: true, message: '请选择商品状态', trigger: 'blur' }],
  mainImage: [{ required: true, message: '请上传商品主图片', trigger: 'change' }],
  imageUrls: [{ required: true, message: '请上传商品轮播图片', trigger: 'change' }]
}

const basicInfoForm = ref()
const saving = ref(false)

/**
 * 只保存基础信息（后端 UpdateInfo，更新商品主表的部分字段）。
 * 不涉及价格、库存、SKU 与商品详情，那些由商品编辑页的「提交商品」统一保存。
 */
function handleSubmitInfo() {
  basicInfoForm.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await updateInfo(props.info)
      ElMessage.success('基础信息已保存（价格、库存、SKU 未改动）')
    } catch (error) {
      // 业务/网络错误由 request 拦截器统一提示，此处不重复弹错
      console.error('[BaseForm] 保存基础信息失败', error)
    } finally {
      saving.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.save-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-basis: 100%;
  width: 100%;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
