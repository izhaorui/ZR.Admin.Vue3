const useDictStore = defineStore('dict', {
  state: () => ({
    // 订单状态
    orderStatusOptions: [
      { dictLabel: '待付款', dictValue: '0', listClass: 'warning', text: '用户已下单但未支付' },
      { dictLabel: '待发货', dictValue: '1', listClass: 'info', text: '用户已支付，商家未发货' },
      { dictLabel: '已发货', dictValue: '2', listClass: 'primary', text: '商家已发货，待用户确认收货' },
      { dictLabel: '已完成', dictValue: '3', listClass: 'success', text: '用户确认收货或系统自动收货' },
      { dictLabel: '已取消', dictValue: '4', listClass: 'danger', text: '用户主动取消订单或超时未支付自动取消' },
      { dictLabel: '已退款', dictValue: '5', listClass: 'danger', text: '用户退款或商家退款,退款完成订单无效' }
    ],
    // 发货状态（与后端 ZR.Mall.Enum.DeliveryStatusEnum 保持一致：0未发货 1已发货 2已送达）
    // 修正：原「已收货」写成 5，与后端 Delivered=2 不符（签收时后端写的是 2），接上页面就会显示错值
    deliveryStatus: [
      { dictLabel: '未发货', dictValue: '0', listClass: 'warning', text: '未发货' },
      { dictLabel: '已发货', dictValue: '1', listClass: 'primary', text: '商家已发货，待用户确认收货' },
      { dictLabel: '已收货', dictValue: '2', listClass: 'danger', text: '确认收货' }
    ],
    // 售卖状态
    saleStatusOptions: [
      { dictLabel: '在售', dictValue: '1' },
      { dictLabel: '下架', dictValue: '0', listClass: 'info' }
    ],
    // 支付方式（与后端 ZR.Mall.Enum.PayTypeEnum 保持一致：0模拟 1微信 2支付宝预留）
    payTypeOptions: [
      { dictLabel: '模拟支付', dictValue: '0', listClass: 'info' },
      { dictLabel: '微信支付', dictValue: '1', listClass: 'success' },
      { dictLabel: '支付宝', dictValue: '2', listClass: 'primary' }
    ],
    // 支付流水状态（与后端 ZR.Mall.Enum.PaymentStatusEnum 保持一致：0预支付 1已支付 2已关闭 3已退款）
    paymentStatusOptions: [
      { dictLabel: '预支付', dictValue: '0', listClass: 'warning' },
      { dictLabel: '已支付', dictValue: '1', listClass: 'success' },
      { dictLabel: '已关闭', dictValue: '2', listClass: 'info' },
      { dictLabel: '已退款', dictValue: '3', listClass: 'danger' }
    ],
    // 退款状态（与后端 ZR.Mall.Enum.RefundStatusEnum 保持一致：0无退款 1退款中 2已退款 3退货中 4已退货）
    // 说明：取消"已支付"订单会先置为 1（退款中），待运营在渠道退款完成后确认，才转为 2（已退款）。
    refundStatusOptions: [
      { dictLabel: '无退款', dictValue: '0', listClass: 'info' },
      { dictLabel: '退款中', dictValue: '1', listClass: 'warning' },
      { dictLabel: '已退款', dictValue: '2', listClass: 'danger' },
      { dictLabel: '退货中', dictValue: '3', listClass: 'warning' },
      { dictLabel: '已退货', dictValue: '4', listClass: 'danger' }
    ],
    // 物流公司（发货下拉；原 ShipmentsForm 页内硬编码收敛至此，后续可迁 sys_dict 后端下发）
    deliveryCompanyOptions: [
      { dictLabel: '顺丰速运', dictValue: '顺丰速运' },
      { dictLabel: '京东物流', dictValue: '京东物流' },
      { dictLabel: '中通快递', dictValue: '中通快递' },
      { dictLabel: '圆通速递', dictValue: '圆通速递' },
      { dictLabel: '申通快递', dictValue: '申通快递' },
      { dictLabel: '韵达快递', dictValue: '韵达快递' },
      { dictLabel: '中国邮政速递', dictValue: '中国邮政速递' },
      { dictLabel: '德邦快递', dictValue: '德邦快递' }
    ],
    // 会员性别（与后端 ums_member Gender 保持一致：0未知 1男 2女）
    memberGenderOptions: [
      { dictLabel: '未知', dictValue: '0' },
      { dictLabel: '男', dictValue: '1' },
      { dictLabel: '女', dictValue: '2' }
    ]
  }),
  actions: {}
})
export default useDictStore
