<template>
  <div v-loading="loading">
  <div v-if="info">
    <el-card header="订单信息" class="mb10">
      <el-descriptions>
        <el-descriptions-item label="订单编号">{{ info.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="下单身份">
          <el-tag v-if="info.memberId" type="success" effect="plain">会员 {{ info.memberId }}</el-tag>
          <el-tag v-else type="info" effect="plain">游客</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <dict-tag :options="dictStore.orderStatusOptions" :value="info.orderStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <dict-tag :options="dictStore.payTypeOptions" :value="info.payType" />
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ info.orderNote }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ info.payTime }}
        </el-descriptions-item>
        <el-descriptions-item label="支付流水号">
          {{ info.transactionId || '—' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card header="收货信息" class="mb10">
      <el-descriptions v-if="info.addressSnapshot">
        <el-descriptions-item label="收货人姓名">
          {{ info.addressSnapshot.userName }}
        </el-descriptions-item>
        <el-descriptions-item label="收货人手机号">{{ info.addressSnapshot.phone }}</el-descriptions-item>
        <el-descriptions-item label="收货地区"> {{ info.addressLabel }}</el-descriptions-item>

        <el-descriptions-item label="详细地址">
          {{ info.addressSnapshot.detailAddress }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card header="商品信息" class="mb10">
      <el-table :data="info.items">
        <el-table-column prop="productPic" label="商品图片">
          <template #default="scope">
            <image-preview :src="scope.row.productPic" style="width: 60px"></image-preview>
          </template>
        </el-table-column>

        <el-table-column prop="productId" label="商品ID"></el-table-column>
        <el-table-column prop="skuId" label="skuID"></el-table-column>
        <el-table-column prop="productName" label="商品名称"></el-table-column>
        <el-table-column prop="skuSpec" label="商品规格"></el-table-column>
        <el-table-column prop="quantity" label="购买数量"></el-table-column>
        <el-table-column prop="totalPrice" label="实付金额"></el-table-column>
      </el-table>
    </el-card>

    <el-card header="物流信息">
      <el-descriptions>
        <el-descriptions-item label="物流公司">{{ info.deliveryCompany }}</el-descriptions-item>
        <el-descriptions-item label="快递单号">{{ info.deliveryNo }}</el-descriptions-item>
        <el-descriptions-item label="发货时间"> {{ info.shipTime }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
  <div v-else>
    <el-empty> {{ loadError || '未查询到订单信息' }} </el-empty>
  </div>
  </div>
</template>

<script setup name="orderdetails">
import { getOMSOrder } from '@/api/shopping/omsorder'
import useDictStore from '@/store/modules/dict'
const route = useRoute()
const info = ref()
const loading = ref(false)
const loadError = ref('')
const dictStore = useDictStore()
watch(
  () => route.query.id,
  (val) => {
    if (val) {
      getInfo(val)
    }
  },
  {
    immediate: true
  }
)

function getInfo(id) {
  loading.value = true
  loadError.value = ''
  getOMSOrder(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      info.value = data
    } else {
      loadError.value = res.msg || '未查询到订单信息'
    }
  }).catch((err) => {
    loadError.value = err?.message || '加载失败'
  }).finally(() => {
    loading.value = false
  })
}
</script>
