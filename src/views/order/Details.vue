<template>
  <div v-loading="loading">
  <div v-if="info">
    <el-card header="订单信息" class="mb10">
      <el-descriptions>
        <el-descriptions-item label="订单编号">{{ info.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="下单身份">
          <el-tag v-if="info.memberId" type="success" effect="plain">会员 {{ info.memberId }}</el-tag>
          <el-tag v-else type="info" effect="plain">未绑定会员</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <dict-tag :options="dictStore.orderStatusOptions" :value="info.orderStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="退款状态">
          <dict-tag :options="dictStore.refundStatusOptions" :value="info.refundStatus" />
        </el-descriptions-item>
        <!-- 金额构成：运费/优惠/积分抵扣/已退金额本期恒为 0，零值不渲染，避免出现「运费 0.00」 -->
        <el-descriptions-item label="总金额">{{ formatMoney(info.totalAmount) }}</el-descriptions-item>
        <el-descriptions-item label="运费" v-if="info.freightAmount > 0">{{ formatMoney(info.freightAmount) }}</el-descriptions-item>
        <el-descriptions-item label="优惠" v-if="info.discountAmount > 0">{{ formatMoney(info.discountAmount) }}</el-descriptions-item>
        <el-descriptions-item label="积分抵扣" v-if="info.integralAmount > 0">{{ formatMoney(info.integralAmount) }}</el-descriptions-item>
        <el-descriptions-item label="付款金额">{{ formatMoney(info.payAmount) }}</el-descriptions-item>
        <el-descriptions-item label="已退金额" v-if="info.refundAmount > 0">{{ formatMoney(info.refundAmount) }}</el-descriptions-item>
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

        <!--
          买家填写的表单值：发货、核对都靠它（虚拟商品的接收账号/充值信息就在这里）。
          敏感字段（手机号/邮箱类型默认算敏感，身份证/银行卡由服务端按值兜底）默认脱敏；
          需要明文发货时点「显示完整内容」——后端要求 oms:order:sensitive 权限并记操作日志。
        -->
        <el-table-column label="买家填写信息" min-width="220">
          <template #default="scope">
            <div v-if="!(scope.row.formValues || []).length" class="text-gray-400">—</div>
            <div v-else class="form-values">
              <el-tooltip
                v-for="item in scope.row.formValues"
                :key="item.field"
                :content="`${item.label}：${item.value}`"
                placement="top"
              >
                <div class="form-values__row">
                  <span class="form-values__label">{{ item.label }}</span>
                  <span class="form-values__value">{{ item.value }}</span>
                </div>
              </el-tooltip>

              <!-- 只在该行确实有敏感字段时才给入口，避免每行都挂一个没用的链接 -->
              <div v-if="hasSensitive(scope.row)" class="form-values__footer">
                <el-link
                  v-if="!revealed.has(scope.row.itemId)"
                  type="primary"
                  :underline="false"
                  @click="revealSensitive(scope.row)"
                >
                  显示完整内容
                </el-link>
                <template v-else>
                  <span class="form-values__revealed">已显示完整内容</span>
                  <el-link type="info" :underline="false" @click="hideSensitive(scope.row)">隐藏</el-link>
                </template>
              </div>
            </div>
          </template>
        </el-table-column>
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
import { ElMessage } from 'element-plus'
import { getOMSOrder, getOrderFormValuesRaw } from '@/api/shopping/omsorder'
import { formatMoney } from '@/utils/money'
import useDictStore from '@/store/modules/dict'
const route = useRoute()
const info = ref()
const loading = ref(false)
const loadError = ref('')
const dictStore = useDictStore()

/**
 * 已揭示完整内容的订单项 itemId 集合
 * 用 Set 而不是对象：切换订单时直接 reassign 即可，不留上一单的残留
 */
const revealed = ref(new Set())

/**
 * 该行是否有敏感字段
 * 直接读后端快照里的 sensitive —— 服务端在保存配置与生成快照时都已补全，
 * 前端不再自己按类型推断（两处推断必然对不上）。
 */
function hasSensitive(row) {
  return (row.formValues || []).some((v) => v.sensitive)
}

/**
 * 揭示该行的敏感字段明文
 * 明文按 field 回填到该行 formValues —— 表格里直接变成可读，不用另开弹窗，
 * 运营复制发货信息时也省一步。再次点击「隐藏」会把这一行还原成脱敏值。
 */
async function revealSensitive(row) {
  try {
    const res = await getOrderFormValuesRaw(info.value.id)
    const raw = res?.data || []
    if (!raw.length) {
      ElMessage.info('该订单没有敏感字段')
      return
    }
    const map = new Map(raw.map((x) => [x.field, x.value]))
    row.formValues.forEach((v) => {
      if (map.has(v.field)) {
        v.value = map.get(v.field)
      }
    })
    revealed.value = new Set([...revealed.value, row.itemId])
  } catch (err) {
    // 没权限时后端会拦，这里只提示，不外泄失败原因（可能是 403，也可能是网络问题）
    ElMessage.error(err?.message || '获取完整内容失败')
  }
}

/** 退回脱敏显示：重新拉一次详情，由服务端重新脱敏 */
function hideSensitive(row) {
  const next = new Set(revealed.value)
  next.delete(row.itemId)
  revealed.value = next
  // 前端无法可靠复原脱敏值（手机号打码后位数都变了），口径只能来自服务端
  getInfo(info.value.id)
}
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
  // 换单时清空揭示态：上一单点开的明文不该在新单上继续显示
  revealed.value = new Set()
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

<style scoped>
/* 买家填写信息：label 与 value 分列，长值靠 tooltip 看全；行数不定，故不用固定高度 */
.form-values__row {
  display: flex;
  gap: 4px;
  line-height: 20px;
}

.form-values__label {
  flex: 0 0 auto;
  color: var(--el-text-color-secondary);
}

.form-values__value {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-values__footer {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-values__revealed {
  color: var(--el-color-success);
}

.text-gray-400 {
  color: var(--el-text-color-placeholder);
}
</style>
