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
    // 发货状态
    deliveryStatus: [
      { dictLabel: '未发货', dictValue: '0', listClass: 'warning', text: '未发货' },
      { dictLabel: '已发货', dictValue: '1', listClass: 'primary', text: '商家已发货，待用户确认收货' },
      { dictLabel: '已收货', dictValue: '5', listClass: 'danger', text: '确认收货' }
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
    ]
  }),
  actions: {}
})
export default useDictStore
