<template>
  <div class="mall-shop">
    <!-- 顶部栏 -->
    <header class="shop-header">
      <div class="logo">🛒 简易商城</div>
      <el-input v-model="keyword" class="search" placeholder="搜索商品" clearable @keyup.enter="doSearch" @clear="doSearch">
        <template #append>
          <el-button icon="Search" @click="doSearch">搜索</el-button>
        </template>
      </el-input>
    </header>

    <!-- 商品网格（只读预览） -->
    <section class="product-grid" v-loading="loading">
      <div class="product-card" v-for="p in products" :key="p.productId" :class="{ disabled: isSoldOut(p) }">
        <div class="cover">
          <img :src="firstImg(p)" :alt="p.productName" @error="onImgError" />
          <span class="badge sold-out" v-if="isSoldOut(p)">已售罄</span>
        </div>
        <div class="name" :title="p.productName">{{ p.productName }}</div>
        <div class="meta">
          <span class="unit" v-if="p.unit">{{ p.unit }}</span>
          <span class="sales">已售 {{ p.totalSalesVolume || 0 }}</span>
        </div>
        <div class="price">
          <span class="cur">{{ formatMoney(p.price) }}</span>
          <span class="range" v-if="p.maxPrice && p.maxPrice > p.price"> ~ {{ formatMoney(p.maxPrice) }}</span>
          <span class="origin" v-if="p.originalPrice && p.originalPrice > p.price">{{ formatMoney(p.originalPrice) }}</span>
        </div>
      </div>
      <el-empty v-if="!loading && products.length === 0" description="暂无在售商品" />
    </section>

    <div class="pager" v-if="total > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNum"
        @current-change="handlePage" />
    </div>
  </div>
</template>

<script setup name="FrontShop">
import { ref, onMounted } from 'vue'
import { listFrontProduct } from '@/api/shopping/front'
import { formatMoney } from '@/utils/money'

/**
 * 简易商城 = 管理端内嵌的 C 端商品**预览**页（路由 /mallshop）。
 *
 * 商城已取消"游客下单"，本页原来内嵌的游客交易流程
 * （我的订单 + 短信验证码查单、下单、模拟/微信收银台、取消订单）已整体移除：
 * 那些接口（shopping/front/order/create|pay|cancel|list|by-no|send-code）在后端已删除，
 * 保留只会得到一堆报错的死代码。
 *
 * 现在只保留匿名可用的**商品浏览**（shopping/front/product/*）。
 * C 端真正的下单/支付/查单在独立商城前端（ZRAdmin-mall-vue3），走会员接口
 * /front/member/order/*（需 mall-token）。
 */
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' fill='%23bbb' font-size='16' text-anchor='middle' dominant-baseline='middle'%3E暂无图片%3C/text%3E%3C/svg%3E"

const keyword = ref('')
const products = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)

function firstImg(p) {
  if (p.mainImage) return p.mainImage
  if (p.imageUrls) return p.imageUrls.split(',')[0]
  return PLACEHOLDER
}
function onImgError(e) {
  e.target.src = PLACEHOLDER
}
function isSoldOut(p) {
  return typeof p.stock === 'number' && p.stock <= 0
}

function extractRows(res) {
  const d = res?.data || res
  return d?.result ?? d?.rows ?? []
}
function extractTotal(res) {
  const d = res?.data || res
  return d?.totalNum ?? d?.total ?? 0
}

async function loadProducts() {
  loading.value = true
  try {
    const res = await listFrontProduct({
      productName: keyword.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    products.value = extractRows(res)
    total.value = extractTotal(res)
  } finally {
    loading.value = false
  }
}

function doSearch() {
  pageNum.value = 1
  loadProducts()
}
function handlePage(p) {
  pageNum.value = p
  loadProducts()
}

onMounted(loadProducts)
</script>

<style scoped>
.mall-shop {
  max-width: 1080px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}
.shop-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0 20px;
}
.logo {
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
  color: #ff5000;
}
.search {
  flex: 1;
  max-width: 480px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  min-height: 200px;
}
.product-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.product-card.disabled {
  opacity: 0.85;
}
.cover {
  position: relative;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f7f7f7;
  border-radius: 8px;
}
.cover img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  color: #fff;
}
.badge.sold-out {
  background: rgba(0, 0, 0, 0.55);
}
.name {
  margin: 10px 0 6px;
  font-size: 14px;
  line-height: 1.4;
  height: 38px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.meta .unit {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 0 6px;
  color: #666;
}
.price {
  color: #ff5000;
  font-weight: 700;
  margin-bottom: 10px;
}
.price .cur {
  font-size: 18px;
}
.price .range {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}
.price .origin {
  font-size: 12px;
  color: #bbb;
  font-weight: 400;
  text-decoration: line-through;
  margin-left: 6px;
}
.pager {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
