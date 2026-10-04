import { ElMessage, ElMessageBox } from 'element-plus'
import { addDateRange } from '@/utils/ruoyi'

/**
 * 列表页数据骨架统一封装。
 *
 * 收敛 52 个列表页里重复的样板：分页请求 / 查询重置 / 勾选态 / 批量删除。
 * 约定后端分页响应为 { data: { result: [], totalNum } }（现有 32 个列表页一致，无例外），
 * 因此无需 dataIndex 映射，传入分页接口即可直接使用。
 *
 * 只收敛 script 层的取数骨架，不接管表格列配置与表单弹窗：
 * 表格列定制需求（字典/图片/开关/行内编辑/操作权限）差异过大，配置化反而是负担。
 *
 * 约定：页面 `<el-form>` 使用 `ref="queryRef"`（与 queryParams 绑定），
 * resetQuery 才能重置表单控件；未绑定时会跳过，不影响其余流程。
 *
 * @param {(params: object) => Promise<any>} listApi 分页接口，接收适配后的查询参数
 * @param {object} [options]
 * @param {object} [options.defaultQuery={}] 初始查询条件（不含 pageNum / pageSize）
 * @param {string} [options.idField='id'] 勾选态取值字段，各页主键不同（userId / roleId / menuId 等）
 * @param {number} [options.pageSize=10] 默认每页条数
 * @param {boolean} [options.immediate=true] 是否在初始化时立即查询
 * @param {boolean} [options.dateRange=false] 是否内置 dateRange 并拼入查询参数
 * @param {string} [options.rangePropName] 日期区间参数名前缀，缺省用 beginTime / endTime
 * @param {(ids: any) => Promise<any>} [options.deleteApi] 删除接口，提供后 del() 才会执行删除
 * @param {string | (() => string)} [options.okText='确定'] 删除确认框确认按钮文案，传函数可保持 i18n 响应性
 * @param {string | (() => string)} [options.cancelText='取消'] 删除确认框取消按钮文案
 * @returns {object} 状态 refs 与方法集合
 */
export function useTable(listApi, options = {}) {
  const {
    defaultQuery = {},
    idField = 'id',
    pageSize: initialPageSize = 10,
    immediate = true,
    dateRange: useDateRange = false,
    rangePropName,
    deleteApi,
    okText = '确定',
    cancelText = '取消'
  } = options

  // 每次重置都从 defaultQuery 重新生成，避免默认值被页面直接改写后无法复位
  const createDefaultQuery = () => ({ ...defaultQuery })

  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  const queryRef = ref(null)
  const queryParams = reactive({ pageNum: 1, pageSize: initialPageSize, ...createDefaultQuery() })
  const dateRange = ref([])
  const ids = ref([])
  const selectedRows = ref([])
  const single = ref(true)
  const multiple = ref(true)

  // 请求竞态标识：快速切换分页或查询时，只采纳最后一次响应，避免旧数据覆盖新数据
  let latestRequestId = 0

  /** 组装查询参数，dateRange 开启时按后端约定展开为 beginTime / endTime */
  function buildParams() {
    const params = { ...queryParams }
    if (!useDateRange) return params
    return addDateRange(params, dateRange.value, rangePropName)
  }

  /**
   * 拉取当前页数据。失败时静默返回 undefined（错误已由 axios 拦截器提示），
   * 并在 finally 中复位 loading —— 避免 code != 200 时 loading 永久卡住。
   */
  async function getList() {
    const requestId = ++latestRequestId
    loading.value = true
    try {
      const res = await listApi(buildParams())
      if (requestId !== latestRequestId) return undefined
      list.value = res?.data?.result ?? []
      total.value = res?.data?.totalNum ?? 0
      return res
    } catch (err) {
      return undefined
    } finally {
      if (requestId === latestRequestId) {
        loading.value = false
      }
    }
  }

  /** 查询：回到第一页后重新拉取 */
  function handleQuery() {
    queryParams.pageNum = 1
    return getList()
  }

  /**
   * 重置查询：清空表单控件与查询条件后重新拉取。
   * 排序字段（sort / sortType）等没有对应表单项的条件也一并复位，
   * 避免重置后残留上一次排序。
   */
  function resetQuery() {
    queryRef.value?.resetFields?.()
    dateRange.value = []
    Object.assign(queryParams, createDefaultQuery())
    return handleQuery()
  }

  /** 勾选变化：同步选中行、选中 id、单选/多选可用态 */
  function onSelectionChange(selection = []) {
    selectedRows.value = selection
    ids.value = selection.map((item) => item[idField])
    single.value = selection.length !== 1
    multiple.value = selection.length === 0
  }

  /**
   * 删除：未传 id 时使用勾选中的 ids。
   * 需在 options 中提供 deleteApi，否则只返回待删除的 id 交由页面自行处理。
   *
   * @param {any} [id] 行上的主键值，与勾选 ids 二选一
   * @param {string} [tip] 确认框中的业务名称
   * @returns {Promise<void>}
   */
  async function del(id, tip) {
    const targetIds = id || ids.value
    if (!deleteApi) {
      console.warn('[useTable] del() 需要在 options 中传入 deleteApi 才能执行删除')
      return
    }
    // 文案允许传函数，便于使用 i18n 的 $t（语言切换后仍能取到最新文案）
    const resolveText = (text) => (typeof text === 'function' ? text() : text)
    try {
      await ElMessageBox.confirm(`是否确认删除${tip ? tip : '数据项'}编号为"${targetIds}"的数据项？`, '警告', {
        confirmButtonText: resolveText(okText),
        cancelButtonText: resolveText(cancelText),
        type: 'warning'
      })
    } catch (err) {
      return
    }
    try {
      await deleteApi(targetIds)
      ElMessage.success('删除成功')
      await getList()
    } catch (err) {
      // 全局拦截器已提示，这里不再重复提示
    }
  }

  if (immediate) {
    getList()
  }

  return {
    // 状态
    list,
    total,
    loading,
    queryParams,
    queryRef,
    dateRange,
    ids,
    selectedRows,
    single,
    multiple,
    // 方法
    getList,
    refresh: getList,
    handleQuery,
    resetQuery,
    onSelectionChange,
    del
  }
}
