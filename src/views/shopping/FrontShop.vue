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
      <el-button class="my-order-btn" icon="Tickets" @click="openMyOrders">我的订单</el-button>
    </header>

    <!-- 商品网格 -->
    <section class="product-grid" v-loading="loading">
      <div class="product-card" v-for="p in products" :key="p.productId" :class="{ disabled: isSoldOut(p) }" @click="openBuy(p)">
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
          <span class="cur">¥{{ p.price }}</span>
          <span class="range" v-if="p.maxPrice && p.maxPrice > p.price"> ~ ¥{{ p.maxPrice }}</span>
          <span class="origin" v-if="p.originalPrice && p.originalPrice > p.price">¥{{ p.originalPrice }}</span>
        </div>
        <el-button type="primary" size="small" :disabled="isSoldOut(p)" @click.stop="openBuy(p)">
          {{ isSoldOut(p) ? '已售罄' : '立即购买' }}
        </el-button>
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

    <!-- 购买弹窗 -->
    <el-dialog v-model="buyVisible" title="确认购买" width="680px" top="6vh" @closed="resetBuy">
      <div v-if="current" class="buy-box">
        <div class="buy-main">
          <div class="buy-gallery">
            <div class="gallery-main">
              <img :src="currentImg" @error="onImgError" />
            </div>
            <div class="gallery-thumbs" v-if="gallery.length > 1">
              <img v-for="(g, i) in gallery" :key="i" :src="g" :class="{ active: g === currentImg }" @click="currentImg = g" @error="onImgError" />
            </div>
          </div>

          <div class="buy-info">
            <div class="buy-name">{{ current.productName }}</div>
            <div class="buy-unit" v-if="current.unit">单位：{{ current.unit }}</div>
            <div class="buy-intro" v-if="current.introduce">{{ current.introduce }}</div>

            <div class="sku-block" v-if="skus.length">
              <div class="block-title">规格</div>
              <div class="sku-list">
                <div
                  v-for="s in skus"
                  :key="s.skuId"
                  class="sku-item"
                  :class="{ active: s.skuId === selectedSkuId, disabled: s.stock <= 0 }"
                  @click="selectSku(s)">
                  <span class="sku-name">{{ s.specCombination || '默认' }}</span>
                  <span class="sku-price">¥{{ s.price }}</span>
                  <span class="sku-stock" :class="{ zero: s.stock <= 0 }">{{ s.stock <= 0 ? '缺货' : '库存' + s.stock }}</span>
                </div>
              </div>
            </div>

            <div class="qty-block">
              <div class="block-title">数量</div>
              <el-input-number v-model="quantity" :min="1" :max="currentStock" />
              <span class="qty-tip" v-if="selectedSku">（库存 {{ currentStock }} 件）</span>
            </div>

            <div class="buy-total">
              <span>合计：</span>
              <span class="amount">¥{{ totalAmount }}</span>
            </div>
          </div>
        </div>

        <el-divider />

        <el-form ref="addressFormRef" :model="address" label-width="92px" class="addr-form">
          <el-form-item label="收货人" required>
            <el-input v-model="address.userName" placeholder="请输入收货人" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone" :rules="phoneRules">
            <el-input
              v-model="address.phone"
              maxlength="11"
              placeholder="用于下单校验与查询订单"
              @input="address.phone = (address.phone || '').replace(/\D/g, '')" />
          </el-form-item>
          <el-form-item label="验证码" required>
            <el-input v-model="buyCode" maxlength="6" placeholder="请先获取短信验证码" style="flex: 1; margin-right: 8px">
              <template #append>
                <el-button :disabled="buyCodeCountdown > 0 || !validatePhone(address.phone)" @click="sendBuyCode">
                  {{ buyCodeCountdown > 0 ? buyCodeCountdown + 's' : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="所在地区" required>
            <el-cascader
              v-model="region"
              :options="regionOptions"
              :props="{ expandTrigger: 'hover' }"
              placeholder="请选择省 / 市 / 区"
              clearable
              class="w100" />
          </el-form-item>
          <el-form-item label="详细地址" required>
            <el-input v-model="address.detailAddress" type="textarea" :rows="2" placeholder="街道/门牌号等详细地址" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="buyVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" :disabled="isBuyDisabled" @click="submitOrder">提交订单</el-button>
      </template>
    </el-dialog>

    <!-- 收银台 -->
    <el-dialog v-model="payVisible" title="收银台" width="420px" :close-on-click-modal="false" :show-close="false" @closed="resetPay">
      <div class="pay-box">
        <div class="pay-amount">
          <span class="label">应付金额</span>
          <span class="money">¥{{ payInfo.payAmount }}</span>
        </div>
        <div class="pay-order-no">订单号：{{ payInfo.orderNo }}</div>

        <!-- 真实微信支付：吊起 H5 页面并轮询状态 -->
        <div v-if="payMode === 'real'" class="pay-real">
          <p class="pay-real-tip">已为您打开微信支付页面，请完成付款。</p>
          <p v-if="payH5Url" class="pay-real-link">
            未自动弹出？
            <el-link type="primary" :href="payH5Url" target="_blank" rel="noopener">点击此处手动打开</el-link>
          </p>
          <p class="pay-real-sub">支付成功后状态会自动更新；也可稍后在「我的订单」继续支付</p>
        </div>

        <!-- 渠道选择（仅模拟/未开通真实支付时展示；当前仅微信已接入） -->
        <div v-else class="pay-channels">
          <div class="pay-channel" :class="{ active: payChannel === 'wechat' }" @click="payChannel = 'wechat'">
            <span class="icon wechat">微</span>
            <span>微信支付</span>
          </div>
          <div class="pay-channel disabled-channel">
            <span class="icon alipay">支</span>
            <span>支付宝</span>
            <span class="coming">暂未开通</span>
          </div>
        </div>

        <div class="pay-tip" v-if="payMode !== 'real'">模拟支付环境：点击"确认支付"即视为支付成功，不产生真实扣款</div>
      </div>
      <template #footer>
        <template v-if="payMode === 'real'">
          <el-button @click="abortPay">取消支付</el-button>
          <el-button type="primary" @click="checkPaidThenFinish">已完成支付</el-button>
        </template>
        <template v-else>
          <el-button @click="skipPay">暂不支付</el-button>
          <el-button type="primary" :loading="paying" @click="confirmPay">确认支付 ¥{{ payInfo.payAmount }}</el-button>
        </template>
      </template>
    </el-dialog>

    <!-- 我的订单弹窗 -->
    <el-dialog v-model="orderVisible" title="我的订单" width="560px" top="6vh" @closed="resetOrder">
      <el-input v-model="queryPhone" placeholder="输入下单手机号" class="mb10">
        <template #append>
          <el-button :disabled="codeCountdown > 0 || !validatePhone(queryPhone)" @click="sendCode">
            {{ codeCountdown > 0 ? codeCountdown + 's' : '获取验证码' }}
          </el-button>
        </template>
      </el-input>
      <el-input v-model="code" placeholder="请输入短信验证码" class="mb10">
        <template #append>
          <el-button icon="Search" @click="loadMyOrders">查询</el-button>
        </template>
      </el-input>
      <div v-loading="orderLoading">
        <div class="order-card" v-for="o in myOrders" :key="o.id">
          <div class="order-top">
            <span class="order-no">订单号：{{ o.orderNo }}</span>
            <el-tag :type="statusType(o.orderStatus)">{{ statusText(o.orderStatus) }}</el-tag>
            <dict-tag v-if="o.orderStatus >= 1 && o.payType != null" :options="dictStore.payTypeOptions" :value="o.payType" class="ml10" />
          </div>
          <div class="order-items">
            <div class="order-item" v-for="it in o.items || []" :key="it.itemId">
              <img :src="it.productPic || PLACEHOLDER" class="item-pic" @error="onImgError" />
              <span class="item-name">{{ it.productName }}</span>
              <span class="item-spec" v-if="it.skuSpec">{{ it.skuSpec }}</span>
              <span class="item-qty">x{{ it.quantity }}</span>
              <span class="item-price">¥{{ it.totalPrice }}</span>
            </div>
          </div>
          <div class="order-foot">
            <div class="order-addr">
              <div>收货人：{{ o.addressSnapshot?.userName }} {{ o.addressSnapshot?.phone }}</div>
              <div class="addr-detail">{{ addressText(o) }}</div>
            </div>
            <span class="total">合计：¥{{ o.totalAmount }}</span>
          </div>
          <div class="order-actions" v-if="o.orderStatus === 0 || o.orderStatus === 1">
            <el-button v-if="o.orderStatus === 0" type="primary" size="small" @click="payFromOrder(o)">去支付</el-button>
            <el-button type="danger" link @click="cancelOrder(o)">取消订单</el-button>
          </div>
        </div>
        <el-empty v-if="!orderLoading && myOrders.length === 0" description="暂无订单" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="FrontShop">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listFrontProduct,
  getFrontProduct,
  createFrontOrder,
  listFrontOrder,
  getFrontOrderByNo,
  sendFrontCode,
  cancelFrontOrder,
  payFrontOrder
} from '@/api/shopping/front'
import { regionOptions } from './regions'
import useDictStore from '@/store/modules/dict'

const dictStore = useDictStore()

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' fill='%23bbb' font-size='16' text-anchor='middle' dominant-baseline='middle'%3E暂无图片%3C/text%3E%3C/svg%3E"

const keyword = ref('')
const products = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)

const buyVisible = ref(false)
const current = ref(null)
const currentImg = ref('')
const gallery = computed(() => {
  if (!current.value) return []
  const arr = []
  if (current.value.mainImage) arr.push(current.value.mainImage)
  if (current.value.imageUrls) arr.push(...current.value.imageUrls.split(',').filter(Boolean))
  return arr.length ? arr : [PLACEHOLDER]
})
const skus = ref([])
const selectedSkuId = ref(null)
const selectedSku = computed(() => skus.value.find((x) => x.skuId === selectedSkuId.value) || null)
const quantity = ref(1)
const submitting = ref(false)
const address = ref({ userName: '', phone: '', detailAddress: '' })
const region = ref([])
const requestId = ref('')
// 下单验证码
const buyCode = ref('')
const buyCodeCountdown = ref(0)
let buyCodeTimer = null

// 模拟收银台
const payVisible = ref(false)
const payInfo = ref({ orderNo: '', payAmount: 0, phone: '' })
const paying = ref(false)
const payChannel = ref('wechat')
// 真实微信支付相关：payMode='real' 时后端返回 h5Url，需新窗口吊起并轮询订单状态
const payMode = ref('mock') // 'mock' | 'real'
const payH5Url = ref('')
let h5Win = null
let payPollTimer = null

const orderVisible = ref(false)
const queryPhone = ref('')
const code = ref('')
const codeCountdown = ref(0)
let codeTimer = null
const myOrders = ref([])
const orderLoading = ref(false)

const statusMap = {
  0: '待付款',
  1: '待发货',
  2: '已发货',
  3: '已完成',
  4: '已取消',
  5: '已关闭'
}
const statusTypeMap = {
  0: 'info',
  1: 'warning',
  2: 'primary',
  3: 'success',
  4: 'info',
  5: 'danger'
}
function statusText(s) {
  return statusMap[s] ?? '未知'
}
function statusType(s) {
  return statusTypeMap[s] ?? 'info'
}

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
function addressText(o) {
  const snap = o.addressSnapshot || {}
  const detail = snap.detailAddress || ''
  const region = [snap.province, snap.city, snap.district].filter(Boolean).join('')
  return region + detail || o.addressLabel || '—'
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

async function openBuy(p) {
  current.value = p
  currentImg.value = firstImg(p)
  quantity.value = 1
  address.value = { userName: '', phone: '', detailAddress: '' }
  region.value = []
  requestId.value = crypto?.randomUUID?.() || 'r' + Date.now() + Math.random()
  // 拉取规格
  const res = await getFrontProduct(p.productId)
  const d = res?.data || res
  skus.value = d?.skus || []
  const firstOk = skus.value.find((s) => s.stock > 0) || skus.value[0]
  selectedSkuId.value = firstOk ? firstOk.skuId : null
  buyVisible.value = true
}

function resetBuy() {
  current.value = null
  currentImg.value = ''
  skus.value = []
  selectedSkuId.value = null
  buyCode.value = ''
  buyCodeCountdown.value = 0
  if (buyCodeTimer) clearInterval(buyCodeTimer)
}

function selectSku(s) {
  if (s.stock <= 0) return
  selectedSkuId.value = s.skuId
  if (Number(quantity.value) > s.stock) quantity.value = s.stock
}

const currentStock = computed(() => {
  const s = selectedSku.value
  return s ? s.stock : 9999
})
const totalAmount = computed(() => {
  const price = selectedSku.value?.price ?? current.value?.price ?? 0
  return (Number(price) * Number(quantity.value || 1)).toFixed(2)
})
const isBuyDisabled = computed(() => {
  if (!selectedSkuId.value) return true
  if (currentStock.value <= 0) return true
  if (Number(quantity.value) > currentStock.value) return true
  return false
})

function validatePhone(phone) {
  return /^1\d{10}$/.test(phone)
}

// 手机号表单校验规则（必填 + 11位手机号格式），与后端下单/发码一致
const phoneRules = [
  { required: true, message: '请输入手机号', trigger: 'blur' },
  { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
]

async function submitOrder() {
  if (!selectedSkuId.value) {
    ElMessage.warning('请选择商品规格')
    return
  }
  if (!address.value.userName) {
    ElMessage.warning('请填写收货人')
    return
  }
  if (!validatePhone(address.value.phone)) {
    ElMessage.warning('请填写正确的手机号')
    return
  }
  if (!address.value.detailAddress) {
    ElMessage.warning('请填写详细地址')
    return
  }
  if (region.value.length < 3) {
    ElMessage.warning('请选择所在地区')
    return
  }
  if (Number(quantity.value) > currentStock.value) {
    ElMessage.warning('购买数量超出库存')
    return
  }
  if (!buyCode.value) {
    ElMessage.warning('请先获取并输入短信验证码')
    return
  }
  submitting.value = true
  try {
    const res = await createFrontOrder({
      items: [{ skuId: selectedSkuId.value, quantity: quantity.value }],
      address: {
        userName: address.value.userName,
        phone: address.value.phone,
        province: region.value[0],
        city: region.value[1],
        district: region.value[2],
        detailAddress: address.value.detailAddress
      },
      orderNote: '',
      requestId: requestId.value,
      code: buyCode.value
    })
    const data = res?.data || res
    buyVisible.value = false
    queryPhone.value = address.value.phone
    // 下单成功 → 打开模拟收银台（待付款）
    payInfo.value = {
      orderNo: data?.orderNo || '',
      payAmount: data?.totalAmount ?? totalAmount.value,
      phone: address.value.phone
    }
    // 下单后立即按订单号拉取并写入"我的订单"，后续支付/跳过即可直接看到
    fetchAndStoreOrder(data?.orderNo, address.value.phone)
    payChannel.value = 'wechat'
    payVisible.value = true
  } finally {
    submitting.value = false
  }
}

// 收银台支付：根据后端返回区分真实微信支付与模拟支付
async function confirmPay() {
  if (!payInfo.value.orderNo) return
  paying.value = true
  try {
    const res = await payFrontOrder({ orderNo: payInfo.value.orderNo, phone: payInfo.value.phone })
    const data = res?.data || res
    // 真实微信支付：后端返回 h5Url，需新窗口吊起 H5 支付页并轮询订单状态
    if (data?.h5Url) {
      payMode.value = 'real'
      payChannel.value = 'wechat'
      openWechatH5(data.h5Url)
    } else {
      // 模拟支付：直接成功
      finishPay()
    }
  } catch (e) {
    // 失败原因由响应拦截器统一提示
  } finally {
    paying.value = false
  }
}

// 支付完成统一收尾（模拟成功，或真实支付回调后轮询检测到已支付）
async function finishPay() {
  payVisible.value = false
  closeH5()
  stopPolling()
  ElMessage.success(`支付成功！订单 ${payInfo.value.orderNo} 已进入待发货`)
  await fetchAndStoreOrder(payInfo.value.orderNo, payInfo.value.phone)
  orderVisible.value = true
}

// 打开微信 H5 支付页（新窗口），并启动订单状态轮询
function openWechatH5(url) {
  payH5Url.value = url
  h5Win = window.open(url, '_blank', 'noopener')
  startPolling()
}

// 轮询订单状态：微信异步回调完成支付后，订单状态流转为待发货(>=1)
function startPolling() {
  stopPolling()
  payPollTimer = setInterval(async () => {
    try {
      const res = await getFrontOrderByNo({ orderNo: payInfo.value.orderNo, phone: payInfo.value.phone })
      const data = res.data || {}
      const order = data.result ? data.result[0] : data
      if (order && order.orderStatus >= 1) {
        finishPay()
      }
    } catch (e) {
      // 查询失败忽略，等待下一次轮询
    }
  }, 3000)
}
function stopPolling() {
  if (payPollTimer) {
    clearInterval(payPollTimer)
    payPollTimer = null
  }
}
function closeH5() {
  if (h5Win && !h5Win.closed) {
    try {
      h5Win.close()
    } catch (e) {}
  }
  h5Win = null
}

// 真实支付下：用户手动确认"已完成支付"，先校验状态再收尾
async function checkPaidThenFinish() {
  try {
    const res = await getFrontOrderByNo({ orderNo: payInfo.value.orderNo, phone: payInfo.value.phone })
    const data = res.data || {}
    const order = data.result ? data.result[0] : data
    if (order && order.orderStatus >= 1) {
      finishPay()
    } else {
      ElMessage.warning('订单尚未支付完成，请在新窗口完成支付后重试')
    }
  } catch (e) {
    ElMessage.warning('查询订单状态失败，请稍候重试')
  }
}

// 真实支付下：放弃本次支付，保留待付款订单
function abortPay() {
  closeH5()
  stopPolling()
  payVisible.value = false
  fetchAndStoreOrder(payInfo.value.orderNo, payInfo.value.phone)
  orderVisible.value = true
  ElMessage.info(`订单已保存为待付款，可在"我的订单"中继续支付（订单号：${payInfo.value.orderNo}）`)
}

// 收银台关闭时清理轮询与弹窗
function resetPay() {
  payMode.value = 'mock'
  payH5Url.value = ''
  closeH5()
  stopPolling()
}

// 暂不支付：保留待付款订单，可稍后在"我的订单"里继续支付
async function skipPay() {
  payVisible.value = false
  await fetchAndStoreOrder(payInfo.value.orderNo, payInfo.value.phone)
  orderVisible.value = true
  ElMessage.info(`订单已保存为待付款，可在"我的订单"中继续支付（订单号：${payInfo.value.orderNo}）`)
}

// 从"我的订单"发起支付（待付款单）
function payFromOrder(o) {
  payInfo.value = {
    orderNo: o.orderNo,
    payAmount: o.payAmount ?? o.totalAmount,
    phone: o.addressSnapshot?.phone || queryPhone.value
  }
  payChannel.value = 'wechat'
  payVisible.value = true
}

function openMyOrders() {
  orderVisible.value = true
}

// 下单/支付后按订单号+手机号立即可查（免验证码，与 pay 同权），拉取后写入"我的订单"列表
async function fetchAndStoreOrder(orderNo, phone) {
  if (!orderNo || !phone) return
  try {
    const res = await getFrontOrderByNo({ orderNo, phone })
    const data = res.data || {}
    // 兼容：单对象(data 即订单) 或 分页对象(data.result[0])
    const order = data.result ? data.result[0] : data
    if (order && order.orderNo) {
      const idx = myOrders.value.findIndex((x) => x.orderNo === orderNo)
      if (idx >= 0) myOrders.value[idx] = order
      else myOrders.value = [order, ...myOrders.value]
    }
  } catch (e) {
    // 查询失败忽略，用户仍可手动按验证码查询
  }
}

async function sendCode() {
  if (!validatePhone(queryPhone.value)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  const res = await sendFrontCode({ phone: queryPhone.value })
  const data = res?.data || res
  if (data?.devCode) {
    code.value = data.devCode
    ElMessage.success('验证码已发送（开发模式，已自动填入）：' + data.devCode)
    loadMyOrders()
  } else {
    ElMessage.success('验证码已发送，请查收短信')
  }
  codeCountdown.value = 60
  codeTimer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) clearInterval(codeTimer)
  }, 1000)
}

// 下单验证码（type=5）：证明手机号归属，防止填他人手机号下单
async function sendBuyCode() {
  if (!validatePhone(address.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  const res = await sendFrontCode({ phone: address.value.phone, type: 5 })
  const data = res?.data || res
  if (data?.devCode) {
    buyCode.value = data.devCode
    ElMessage.success('验证码已发送（开发模式，已自动填入）：' + data.devCode)
  } else {
    ElMessage.success('验证码已发送，请查收短信')
  }
  buyCodeCountdown.value = 60
  buyCodeTimer = setInterval(() => {
    buyCodeCountdown.value--
    if (buyCodeCountdown.value <= 0) clearInterval(buyCodeTimer)
  }, 1000)
}

async function loadMyOrders() {
  if (!validatePhone(queryPhone.value)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!code.value) {
    ElMessage.warning('请先获取并输入短信验证码')
    return
  }
  orderLoading.value = true
  try {
    const res = await listFrontOrder({ phone: queryPhone.value, code: code.value, pageNum: 1, pageSize: 20 })
    myOrders.value = extractRows(res)
  } finally {
    orderLoading.value = false
  }
}

function resetOrder() {
  code.value = ''
  codeCountdown.value = 0
  if (codeTimer) clearInterval(codeTimer)
}

// 游客取消订单：向订单手机号发送验证码，输入后取消并回补库存
async function cancelOrder(o) {
  const phone = o.addressSnapshot?.phone
  if (!validatePhone(phone)) {
    ElMessage.warning('订单手机号异常')
    return
  }
  const res = await sendFrontCode({ phone })
  const devCode = res?.data?.devCode ?? res?.devCode
  const input = await ElMessageBox.prompt(`已发送验证码到 ${phone}，请输入验证码`, '取消订单', {
    confirmButtonText: '确定取消',
    cancelButtonText: '放弃',
    inputValue: devCode || ''
  }).catch(() => null)
  if (!input) return
  try {
    await cancelFrontOrder({ id: o.id, phone, code: input.value })
    ElMessage.success('订单已取消')
    o.orderStatus = 4
  } catch (e) {
    // 失败原因已由响应拦截器统一提示
  }
}

onMounted(loadProducts)

// 组件卸载时清理轮询定时器与微信 H5 弹窗，避免内存/定时器泄漏
onUnmounted(() => {
  stopPolling()
  closeH5()
})
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
.my-order-btn {
  white-space: nowrap;
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
  cursor: pointer;
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
  cursor: not-allowed;
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
.product-card :deep(.el-button) {
  margin-top: auto;
}
.pager {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.buy-main {
  display: flex;
  gap: 16px;
}
.buy-gallery {
  width: 220px;
  flex-shrink: 0;
}
.gallery-main {
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f7;
  border-radius: 8px;
  overflow: hidden;
}
.gallery-main img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.gallery-thumbs {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.gallery-thumbs img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border: 2px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  background: #f7f7f7;
}
.gallery-thumbs img.active {
  border-color: #ff5000;
}
.buy-info {
  flex: 1;
  min-width: 0;
}
.buy-name {
  font-size: 16px;
  font-weight: 600;
}
.buy-unit {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}
.buy-intro {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 6px 0 10px;
  max-height: 60px;
  overflow: auto;
}
.block-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
.sku-block,
.qty-block {
  margin-bottom: 12px;
}
.sku-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.sku-item {
  position: relative;
  min-width: 120px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: #fff;
}
.sku-item:hover:not(.disabled) {
  border-color: #ff5000;
}
.sku-item.active {
  border-color: #ff5000;
  box-shadow: 0 0 0 2px rgba(255, 80, 0, 0.15);
}
.sku-item.active::after {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 12px;
  color: #fff;
  background: #ff5000;
  border-radius: 50%;
}
.sku-item.disabled {
  cursor: not-allowed;
  background: #f5f5f5;
  opacity: 0.7;
}
.sku-name {
  font-size: 14px;
  color: #333;
}
.sku-price {
  color: #ff5000;
  font-size: 13px;
  font-weight: 600;
}
.sku-stock {
  font-size: 12px;
  color: #999;
}
.sku-stock.zero {
  color: #f56c6c;
}
.qty-tip {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
.buy-total {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 6px;
}
.buy-total .amount {
  color: #ff5000;
  font-size: 22px;
  font-weight: 700;
}
.addr-form {
  margin-top: 4px;
}
.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}
.order-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.order-no {
  font-size: 13px;
  color: #333;
}
.order-items {
  border-top: 1px dashed #eee;
  border-bottom: 1px dashed #eee;
  padding: 8px 0;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 4px 0;
}
.item-pic {
  width: 36px;
  height: 36px;
  object-fit: contain;
  background: #f7f7f7;
  border-radius: 4px;
}
.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-spec {
  font-size: 12px;
  color: #999;
}
.item-qty {
  color: #999;
}
.item-price {
  color: #ff5000;
}
.order-foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}
.order-addr .addr-detail {
  color: #999;
  margin-top: 2px;
}
.order-foot .total {
  color: #ff5000;
  font-weight: 700;
  font-size: 14px;
}
.order-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}
.pay-box {
  text-align: center;
}
.pay-amount {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
}
.pay-amount .label {
  font-size: 13px;
  color: #999;
}
.pay-amount .money {
  font-size: 32px;
  font-weight: 700;
  color: #ff5000;
}
.pay-order-no {
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
}
.pay-channels {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 14px;
}
.pay-channel {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.pay-channel.active {
  border-color: #ff5000;
  box-shadow: 0 0 0 2px rgba(255, 80, 0, 0.15);
}
.pay-channel .icon {
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  text-align: center;
}
.pay-channel .icon.wechat {
  background: #07c160;
}
.pay-channel .icon.alipay {
  background: #1677ff;
}
.pay-tip {
  font-size: 12px;
  color: #bbb;
}
.pay-real {
  margin-bottom: 14px;
  font-size: 13px;
  color: #666;
}
.pay-real-tip {
  color: #07c160;
  font-weight: 600;
  margin-bottom: 6px;
}
.pay-real-link {
  margin-bottom: 6px;
}
.pay-real-sub {
  color: #bbb;
  font-size: 12px;
}
.pay-channel.disabled-channel {
  cursor: not-allowed;
  opacity: 0.6;
}
.pay-channel .coming {
  font-size: 11px;
  color: #bbb;
  margin-left: 4px;
}
.mb10 {
  margin-bottom: 10px;
}
</style>
