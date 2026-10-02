import { computed } from 'vue'

// 与 ProductEdit 的 el-tabs name 对应
const TAB_BASIC = 'base'
const TAB_SKU = 'sku'

/**
 * 商品编辑的问题清单。
 *
 * 把「必填缺失 / 规格与 SKU 异常 / 限购配置」收敛成一份带 level 与 tab 的清单，
 * 供提交前的统一校验与「去处理」跳转共用，避免各处再写一遍校验。
 *
 * level：error = 阻塞提交；warning = 只提醒，不拦。
 * tab：问题所在的标签页（base=基本信息，sku=价格/库存），用于提交校验失败时自动切换。
 *
 * @param {object} form 商品编辑的响应式表单 { data, specList, skus }
 * @returns {{
 *   allIssues: import('vue').ComputedRef<Array<{ level: string, tab: string, text: string }>>,
 *   blockerIssues: import('vue').ComputedRef<Array>
 * }}
 */
export function useProductIssues(form) {
  // 基本信息：必填缺失为 error，影响前台展示的为 warning
  const basicIssues = computed(() => {
    const list = []
    if (!(form.data.productName || '').trim()) {
      list.push({ level: 'error', tab: TAB_BASIC, text: '商品名称未填写' })
    }
    if (!form.data.mainImage) {
      list.push({ level: 'error', tab: TAB_BASIC, text: '商品主图未上传' })
    }
    if (!form.data.imageUrls) {
      list.push({ level: 'error', tab: TAB_BASIC, text: '轮播图片未上传' })
    }
    if (form.data.saleStatus === undefined || form.data.saleStatus === null || form.data.saleStatus === '') {
      list.push({ level: 'error', tab: TAB_BASIC, text: '商品状态未选择' })
    }
    if (!form.data.categoryId) {
      list.push({ level: 'warning', tab: TAB_BASIC, text: '未选择商品分类，前台按分类筛选时查不到该商品' })
    }
    // 运费模板未绑定是 warning 而非 error：存在默认模板时未绑定也能正常计费，
    // 一个模板都没配时则计 0 运费 —— 两种情况都不该拦住运营发布商品。
    // 提示的价值在于让运营知道"这个商品不会按我以为的方式计运费"。
    if (!form.data.freightTemplateId) {
      list.push({ level: 'warning', tab: TAB_BASIC, text: '未绑定运费模板，将按默认模板计费；若未设置默认模板则计 0 运费' })
    }
    return list
  })

  // 价格与库存：规格定义、SKU 明细、限购
  const skuIssues = computed(() => {
    const list = []
    const isSingle = form.data.specType === 1

    if (!isSingle) {
      if (!form.specList.length) {
        list.push({ level: 'error', tab: TAB_SKU, text: '还没有添加商品规格，切到多规格后至少要有一个规格维度' })
      }
      const nameCount = new Map()
      form.specList.forEach((spec, index) => {
        const name = (spec.name || '').trim()
        if (!name) {
          list.push({ level: 'error', tab: TAB_SKU, text: `第 ${index + 1} 个规格的名称未填写` })
        } else {
          nameCount.set(name, (nameCount.get(name) || 0) + 1)
        }
        const values = spec.values || []
        if (!values.length) {
          list.push({ level: 'error', tab: TAB_SKU, text: `规格「${name || `第 ${index + 1} 个`}」还没有规格值，不会生成 SKU` })
        } else if (new Set(values.map((item) => String(item).trim())).size !== values.length) {
          list.push({ level: 'error', tab: TAB_SKU, text: `规格「${name || `第 ${index + 1} 个`}」的规格值有重复` })
        }
      })
      nameCount.forEach((count, name) => {
        if (count > 1) {
          list.push({ level: 'error', tab: TAB_SKU, text: `规格名「${name}」重复了 ${count} 次，会导致 SKU 组合与前台规格选择串数据` })
        }
      })
    }

    if (!form.skus.length) {
      list.push({ level: 'error', tab: TAB_SKU, text: isSingle ? '还没有填写单规格的价格与库存' : '还没有生成 SKU，请检查规格名与规格值' })
    }

    const noPriceCount = form.skus.filter((sku) => !(sku.price > 0)).length
    if (noPriceCount) {
      list.push({ level: 'error', tab: TAB_SKU, text: `有 ${noPriceCount} 个 SKU 未填写价格或价格不是正数` })
    }
    const negativeStockCount = form.skus.filter((sku) => Number(sku.stock) < 0).length
    if (negativeStockCount) {
      list.push({ level: 'error', tab: TAB_SKU, text: `有 ${negativeStockCount} 个 SKU 的库存是负数` })
    }
    const zeroStockCount = form.skus.filter((sku) => Number(sku.stock) === 0).length
    if (zeroStockCount) {
      list.push({ level: 'warning', tab: TAB_SKU, text: `有 ${zeroStockCount} 个 SKU 库存为 0，前台会显示售罄` })
    }

    const limit = form.data.purchaseLimit || {}
    if (limit.limit) {
      if (!(limit.totalLimit > 0)) {
        list.push({ level: 'error', tab: TAB_SKU, text: '已开启限购，但总限购件数未填写' })
      }
      if (!(limit.singleLimit > 0)) {
        list.push({ level: 'error', tab: TAB_SKU, text: '已开启限购，但每单限购件数未填写' })
      }
      if (limit.totalLimit > 0 && limit.singleLimit > 0 && limit.singleLimit > limit.totalLimit) {
        list.push({ level: 'warning', tab: TAB_SKU, text: '每单限购大于总限购，请确认是否填反了' })
      }
    }
    return list
  })

  const allIssues = computed(() => [...basicIssues.value, ...skuIssues.value])
  const blockerIssues = computed(() => allIssues.value.filter((issue) => issue.level === 'error'))

  return { allIssues, blockerIssues }
}
