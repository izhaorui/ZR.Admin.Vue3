<template>
  <div class="product-detail-page">
    <el-row :gutter="20">
      <!-- 左侧：商品图 -->
      <el-col :span="10">
        <el-carousel height="400px">
          <el-carousel-item v-for="(img, idx) in product.images" :key="idx">
            <img :src="img" class="product-image" />
          </el-carousel-item>
        </el-carousel>
      </el-col>

      <!-- 右侧：商品信息 + SKU 选择 -->
      <el-col :span="14">
        <h2>{{ product.name }}</h2>
        <p class="text-gray-500">{{ product.description }}</p>

        <!-- SKU选择 -->
        <div v-for="(spec, specIndex) in product.specs" :key="specIndex" class="mt-4">
          <div class="mb-2">{{ spec.name }}：</div>
          <el-radio-group v-model="selectedSpecs[specIndex]">
            <el-radio-button v-for="(val, i) in spec.values" :key="i" :label="val">
              {{ val }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 显示价格 / 库存 -->
        <div class="mt-4">
          <div>
            价格：<span class="text-danger">{{ formatMoney(selectedSku?.price) }}</span>
          </div>
          <div>库存：{{ selectedSku?.stock ?? '--' }} 件</div>
        </div>

        <!-- 操作按钮 -->
        <el-button class="mt-4" type="primary" :disabled="!selectedSku" @click="addToCart"> 加入购物车 </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { formatMoney } from '@/utils/money'

// 商品信息结构
const product = ref({
  name: '',
  description: '',
  images: [],
  specs: [], // [{ name: '颜色', values: ['红', '蓝'] }, ...]
  skus: [] // [{ specs: ['红', 'M'], price: 100, stock: 50 }, ...]
})

// 当前选择的规格项
const selectedSpecs = ref([])

// 当前选中的 SKU
const selectedSku = computed(() => {
  if (!selectedSpecs.value.length || selectedSpecs.value.includes('')) return null
  return product.value.skus.find((sku) => JSON.stringify(sku.specs) === JSON.stringify(selectedSpecs.value))
})

const route = useRoute()

// 模拟加载商品详情
onMounted(async () => {
  const { data } = await axios.get(`/api/product/detail/${route.params.id}`)
  product.value = data
  selectedSpecs.value = Array(product.value.specs.length).fill('')
})

// 加入购物车
function addToCart() {
  if (!selectedSku.value) {
    ElMessage.warning('请先选择规格')
    return
  }
  ElMessage.success(`已加入购物车，SKU: ${selectedSpecs.value.join('/')}，数量 1`)
}
</script>
