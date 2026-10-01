import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox, dayjs } from 'element-plus'

const DRAFT_KEY_PREFIX = 'shopping:product:draft:'
// 表单变更后延迟落草稿，避免连续输入时频繁写 localStorage
const SAVE_DELAY = 800

/**
 * 表单内容签名：按键名排序后再序列化。
 *
 * 规格表单在挂载/重建 SKU 时会重新 emit 一遍数据（内容相同、引用不同），
 * 单规格表单还会改变字段顺序，直接 JSON.stringify 比不出"真的改没改"。
 *
 * @param {object} value 任意表单数据
 * @returns {any} 键名已排序的副本
 */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonical(value[key])
        return acc
      }, {})
  }
  return value
}

/**
 * 商品录入的本地草稿，**只在「新增商品」时启用**。
 *
 * 编辑已有商品时服务端数据就是准的，写草稿没有意义：
 * 规格表单重建 SKU 会产生一份与数据库一致的内容，若还去弹「发现未提交的草稿」，
 * 用户什么都没改也要被问一次。所以编辑态直接不参与草稿，并顺手清掉遗留的草稿。
 *
 * 新增商品没有任何服务端兜底，才需要草稿防「填到一半刷新/关掉/误切路由」：
 * - 表单变更后自动保存（防抖），但**与刚进入时一致就不写**
 * - 进入新增页时如检测到草稿且内容不同，才询问是否恢复
 * - 提交成功或用户选择丢弃时清除
 *
 * @param {object} form 商品编辑的响应式表单 { data, specList, skus }
 * @param {object} route vue-router 的 route，用 route.query.id 区分新增与编辑
 * @returns {{
 *   draftEnabled: import('vue').ComputedRef<boolean>,
 *   draftSavedAt: import('vue').Ref<string>,
 *   saveDraft: (silent?: boolean) => void,
 *   clearDraft: () => void,
 *   checkDraft: () => Promise<void>,
 *   startTracking: () => void,
 *   resetTracking: () => void
 * }}
 */
export function useProductDraft(form, route) {
  // 有 id 说明是编辑已有商品，不参与草稿
  const draftEnabled = computed(() => !route.query.id)
  const draftKey = computed(() => `${DRAFT_KEY_PREFIX}${route.query.id || 'new'}`)
  const draftSavedAt = ref('')
  // 首次加载完成前不写入草稿，否则会用空表单覆盖掉上一次的草稿
  const draftReady = ref(false)
  // 加载完成时的内容快照，用来判断"用户到底改没改"
  let baseline = ''
  let draftTimer = null

  function signature(source) {
    const target = source || form
    return JSON.stringify(canonical({ data: target.data, specList: target.specList, skus: target.skus }))
  }

  function isDirty() {
    return !baseline || signature() !== baseline
  }

  // 进入页面 / 切换商品时调用：暂停自动保存
  function resetTracking() {
    baseline = ''
    draftReady.value = false
    clearTimeout(draftTimer)
  }

  // 数据加载完成后调用：以当前内容为基线，开启自动保存
  function startTracking() {
    if (!draftEnabled.value) return
    baseline = signature()
    draftReady.value = true
  }

  function readDraft() {
    try {
      return JSON.parse(localStorage.getItem(draftKey.value) || 'null')
    } catch (error) {
      console.warn('读取商品草稿失败', error)
      return null
    }
  }

  function saveDraft(silent = true) {
    if (!draftEnabled.value) return
    if (!isDirty()) {
      if (!silent) {
        ElMessage.info('当前内容还没有改动，无需保存草稿')
      }
      return
    }
    try {
      localStorage.setItem(
        draftKey.value,
        JSON.stringify({ data: form.data, specList: form.specList, skus: form.skus, savedAt: Date.now() })
      )
      draftSavedAt.value = dayjs().format('HH:mm:ss')
      if (!silent) {
        ElMessage.success('草稿已保存到本机，下次新增商品时可恢复')
      }
    } catch (error) {
      console.error('保存商品草稿失败', error)
      if (!silent) {
        ElMessage.error('草稿保存失败，可能是本机存储空间不足')
      }
    }
  }

  function clearDraft() {
    localStorage.removeItem(draftKey.value)
    draftSavedAt.value = ''
    // 提交成功或丢弃草稿后不再自动写入
    baseline = ''
    draftReady.value = false
  }

  function applyDraft(draft) {
    form.data = draft.data || {}
    form.data.purchaseLimit = draft.data?.purchaseLimit || { limit: false, totalLimit: 0, singleLimit: 0 }
    form.specList.splice(0, form.specList.length, ...(draft.specList || []))
    form.skus = (draft.skus || []).map((sku) => ({ ...sku }))
    draftSavedAt.value = draft.savedAt ? dayjs(draft.savedAt).format('HH:mm:ss') : ''
  }

  // 有草稿时询问是否恢复；编辑态直接清掉遗留草稿
  async function checkDraft() {
    if (!draftEnabled.value) {
      clearDraft()
      return
    }
    const draft = readDraft()
    if (!draft?.data) return
    // 与刚进入时的内容完全一致的空草稿（自动保存的副作用）直接清掉，不打扰用户
    if (signature(draft) === signature()) {
      clearDraft()
      return
    }
    const savedAt = draft.savedAt ? dayjs(draft.savedAt).format('YYYY-MM-DD HH:mm') : '未知时间'
    try {
      await ElMessageBox.confirm(`检测到 ${savedAt} 保存的草稿，是否恢复？`, '发现未提交的草稿', {
        confirmButtonText: '恢复草稿',
        cancelButtonText: '丢弃草稿',
        type: 'warning'
      })
      applyDraft(draft)
      ElMessage.success('草稿已恢复')
    } catch (error) {
      clearDraft()
    }
  }

  watch(
    () => [form.data, form.specList, form.skus],
    () => {
      if (!draftReady.value) return
      clearTimeout(draftTimer)
      draftTimer = setTimeout(() => saveDraft(true), SAVE_DELAY)
    },
    { deep: true }
  )

  return { draftEnabled, draftSavedAt, saveDraft, clearDraft, checkDraft, startTracking, resetTracking }
}
