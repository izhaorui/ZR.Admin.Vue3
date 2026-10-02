/**
 * 金额展示统一入口：人民币符号 ¥ + 千分位 + 固定两位小数。
 * 各页面不要再手拼 ¥/￥ 字符串（历史上两种符号混用、且未做小数位与千分位处理）。
 */
const MONEY_SYMBOL = '¥'

/**
 * 格式化金额
 * @param {Number|String} value 金额
 * @param {Object} [options] symbol 符号；placeholder 空值占位符
 * @returns {String} 如 ¥1,234.50；空值/非法值返回 placeholder（默认 --）
 */
export function formatMoney(value, { symbol = MONEY_SYMBOL, placeholder = '--' } = {}) {
  if (value === null || value === undefined || value === '') return placeholder
  const num = Number(value)
  if (Number.isNaN(num)) return placeholder
  return symbol + num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * 价格区间：min 与 max 都有且不等时显示「min ~ max」，否则只显示其中一个
 * @param {Number|String} min 最低价
 * @param {Number|String} max 最高价
 * @param {Object} [options] 同 formatMoney
 */
export function formatMoneyRange(min, max, options) {
  const hasMin = min !== null && min !== undefined && min !== ''
  const hasMax = max !== null && max !== undefined && max !== ''
  if (hasMin && hasMax && Number(min) !== Number(max)) {
    return `${formatMoney(min, options)} ~ ${formatMoney(max, options)}`
  }
  return formatMoney(hasMin ? min : max, options)
}
