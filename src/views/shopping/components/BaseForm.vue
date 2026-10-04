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

          <el-col :lg="24">
            <!-- 商品形态：决定要不要收货地址、计不计运费、付款后是否直接完成、买家能不能申请售后。
                 两个取值的后续动作差别很大，用图标卡片而不是文字单选：一眼扫完就知道差别，
                 也省掉"点开下拉才知道这个商品形态是干嘛的"这一步。整行铺开，卡片才有地方放说明。 -->
            <!-- prop 不能少：el-form-item 靠 prop 关联 rules.productType，缺了它这条必填校验不会生效 -->
            <el-form-item label="商品类型" prop="productType">
              <el-radio-group v-model="info.productType" class="type-group">
                <el-radio :value="PRODUCT_TYPE.PHYSICAL" border class="type-card">
                  <!-- 实物用货车、虚拟用礼盒：两个"盒子"图标并排时根本分不出，要靠轮廓差异拉开 -->
                  <span class="type-icon"><Van /></span>
                  <span class="type-text">
                    <span class="type-title">实物</span>
                    <span class="type-desc">要发货 · 填地址 · 计运费</span>
                  </span>
                </el-radio>
                <el-radio :value="PRODUCT_TYPE.VIRTUAL" border class="type-card">
                  <span class="type-icon"><Present /></span>
                  <span class="type-text">
                    <span class="type-title">虚拟（服务类）</span>
                    <span class="type-desc">免地址 · 免运费 · 付款即完成</span>
                  </span>
                </el-radio>
              </el-radio-group>
              <div v-if="isVirtual" class="save-tip">
                <el-icon><InfoFilled /></el-icon>
                虚拟商品不计运费、下单不需收货地址、付款后订单直接完成、买家不能申请售后（运营仍可从订单页退款）。
                <b>改动只影响之后的下单，历史订单保持原形态。</b>
                买家下单要填的东西（如接收账号）在「下单表单」页配置。
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
              <ImageSelector v-model="info.mainImage" :limit="1" :file-size="10"></ImageSelector>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="轮播图片" prop="imageUrls">
              <ImageSelector v-model="info.imageUrls" :limit="CAROUSEL_LIMIT" :file-size="10"></ImageSelector>
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
            只保存本页的商品名称、分类、图片、售卖状态等字段，<b>不含价格、库存、SKU、下单表单与商品详情</b>；完整保存请用底部的「提交商品」。
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
const PRODUCT_TYPE = {
  /** 实物：要发货、填地址、按运费模板计费 */
  PHYSICAL: 1,
  /** 虚拟（服务类）：免地址、免运费、付款即完成 */
  VIRTUAL: 2
}

/**
 * 是否虚拟商品。
 *
 * 只用来置灰运费模板下拉并给出约束说明 —— 真正的行为判定全在服务端
 *（下单免地址、免运费、付款即完成、买家不可售后），前端不做业务判断。
 */
const isVirtual = computed(() => Number(props.info?.productType || 0) === PRODUCT_TYPE.VIRTUAL)

const rules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  introduce: [{ required: false, message: '请输入商品描述', trigger: 'blur' }],
  saleStatus: [{ required: true, message: '请选择商品状态', trigger: 'blur' }],
  mainImage: [{ required: true, message: '请上传商品主图片', trigger: 'change' }],
  imageUrls: [{ required: true, message: '请上传商品轮播图片', trigger: 'change' }],
  productType: [{ required: true, message: '请选择商品类型', trigger: 'change' }]
}

// 轮播图数量上限，与上方 ImageSelector 的 limit 保持一致
const CAROUSEL_LIMIT = 8

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
/*
 * 商品类型图标卡片。
 * 卡片宽度按内容固定（不随栅格拉满），否则两项被拉成两屏宽、右侧留一大片空白；
 * 隐藏 el-radio 的圆点：卡片自身的边框+底色已经表达了选中态，
 * 圆点留在左上角只会跟图标抢位置、把基线挤歪（只藏 .el-radio__inner，
 * 底层的 .el-radio__original 保留，键盘仍可 Tab 聚焦，故补一条 focus 样式）。
 */
.type-group {
  display: flex;
  gap: 12px;
}
.type-card {
  flex: 0 0 auto;
  width: 240px;
  height: auto;
  margin-right: 0;
  padding: 12px 16px;
  align-items: center;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  :deep(.el-radio__inner) {
    display: none;
  }

  :deep(.el-radio__label) {
    display: flex;
    align-items: center;
    gap: 10px;
    /* 圆点位置让给图标，标签左边缘与卡片 padding 对齐 */
    padding-left: 0;
    line-height: 1.4;
  }

  /* 聚焦环只在未选中的卡片上出现：已选中的卡片本身已有主色边框，
     再叠一圈 outline 就成了双线框（鼠标点一下就能看到）。 */
  &:focus-within:not(.is-checked) {
    outline: 2px solid var(--el-color-primary-light-5);
    outline-offset: 1px;
  }

  &.is-checked {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);

    .type-title {
      color: var(--el-color-primary);
    }
    .type-icon {
      color: #fff;
      background-color: var(--el-color-primary);
    }
  }
}
/* 图标放进浅底方块，卡片才有视觉重心；纯图标直接贴在文字旁会显得空 */
.type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 27px;
  height: 27px;
  font-size: 18px;
  color: var(--el-color-primary);
  // background-color: var(--el-color-primary-light-9);
  // border-radius: 8px;
  transition:
    color 0.2s,
    background-color 0.2s;
}
.type-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.type-title {
  font-size: 14px;
  font-weight: 600;
}
.type-desc {
  font-size: 12px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
}

/*
 * 提示行：图标 + 说明文字。
 * 内部按普通段落排版而不是 flex —— 这段内容是「裸文本 + <b> + 裸文本」混排，
 * 用 flex 时每个文本片段会各自成为一个匿名 flex item 并排成一行，
 * 一旦占满整行宽度就摊成几段横排，很难读。图标 inline 对齐基线即可。
 */
.save-tip {
  display: none;
  flex-basis: 100%;
  width: 100%;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);

  :deep(.el-icon) {
    margin-right: 4px;
    vertical-align: -0.15em;
  }
}
</style>
