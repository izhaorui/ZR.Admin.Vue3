import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'

const confirmMock = vi.fn()
const successMock = vi.fn()

vi.mock('element-plus', () => ({
  ElMessage: { success: (...args) => successMock(...args) },
  ElMessageBox: { confirm: (...args) => confirmMock(...args) }
}))

const { useTable } = await import('@/composables/useTable')

const flush = async () => {
  await nextTick()
  await Promise.resolve()
}

describe('useTable', () => {
  beforeEach(() => {
    confirmMock.mockReset()
    successMock.mockReset()
  })

  it('初始化即拉取数据，并解析 result / totalNum', async () => {
    const listApi = vi.fn().mockResolvedValue({ data: { result: [{ userId: 1 }], totalNum: 1 } })
    const table = useTable(listApi, { defaultQuery: { userName: 'a' } })

    await table.getList()
    expect(listApi).toHaveBeenCalledWith({ pageNum: 1, pageSize: 10, userName: 'a' })
    expect(table.list.value).toEqual([{ userId: 1 }])
    expect(table.total.value).toBe(1)
    expect(table.loading.value).toBe(false)
  })

  it('接口异常时静默返回且复位 loading', async () => {
    const listApi = vi.fn().mockRejectedValue(new Error('boom'))
    const table = useTable(listApi)

    await expect(table.getList()).resolves.toBeUndefined()
    expect(table.loading.value).toBe(false)
    expect(table.list.value).toEqual([])
  })

  it('竞态时只采纳最后一次响应', async () => {
    let resolveFirst
    const first = new Promise((resolve) => {
      resolveFirst = resolve
    })
    const listApi = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce({ data: { result: [{ id: 2 }], totalNum: 1 } })
    const table = useTable(listApi, { immediate: false })

    const p1 = table.getList()
    const p2 = table.getList()
    resolveFirst({ data: { result: [{ id: 1 }], totalNum: 1 } })
    await Promise.all([p1, p2])

    expect(table.list.value).toEqual([{ id: 2 }])
  })

  it('handleQuery 回到第一页', async () => {
    const listApi = vi.fn().mockResolvedValue({ data: { result: [], totalNum: 0 } })
    const table = useTable(listApi)
    table.queryParams.pageNum = 3

    await table.handleQuery()
    expect(listApi).toHaveBeenLastCalledWith(expect.objectContaining({ pageNum: 1 }))
  })

  it('resetQuery 复位查询条件与日期区间', async () => {
    const listApi = vi.fn().mockResolvedValue({ data: { result: [], totalNum: 0 } })
    const table = useTable(listApi, { defaultQuery: { userName: '' }, dateRange: true })
    table.queryParams.userName = 'changed'
    table.dateRange.value = ['2024-01-01', '2024-01-31']

    await table.resetQuery()
    expect(table.queryParams.userName).toBe('')
    expect(table.dateRange.value).toEqual([])
    expect(listApi).toHaveBeenLastCalledWith(expect.not.objectContaining({ beginTime: '2024-01-01' }))
  })

  it('dateRange 开启时按 propName 展开区间参数', async () => {
    const listApi = vi.fn().mockResolvedValue({ data: { result: [], totalNum: 0 } })
    const table = useTable(listApi, { dateRange: true, rangePropName: 'Time' })
    table.dateRange.value = ['2024-01-01', '2024-01-31']

    await table.getList()
    expect(listApi).toHaveBeenLastCalledWith(expect.objectContaining({ beginTime: '2024-01-01', endTime: '2024-01-31' }))
  })

  it('onSelectionChange 同步 ids 与单选/多选态', () => {
    const table = useTable(vi.fn(), { immediate: false, idField: 'roleId' })

    table.onSelectionChange([{ roleId: 7 }])
    expect(table.ids.value).toEqual([7])
    expect(table.single.value).toBe(false)
    expect(table.multiple.value).toBe(false)

    table.onSelectionChange([])
    expect(table.ids.value).toEqual([])
    expect(table.single.value).toBe(true)
    expect(table.multiple.value).toBe(true)
  })

  it('del 未提供 deleteApi 时只告警不删除', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const table = useTable(vi.fn(), { immediate: false })
    table.ids.value = [1]

    await table.del()
    expect(warn).toHaveBeenCalled()
    expect(confirmMock).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('del 确认后调用删除接口并刷新列表', async () => {
    confirmMock.mockResolvedValue('confirm')
    const deleteApi = vi.fn().mockResolvedValue({})
    const listApi = vi.fn().mockResolvedValue({ data: { result: [], totalNum: 0 } })
    const table = useTable(listApi, { immediate: false, deleteApi, idField: 'userId' })
    table.ids.value = [5]

    await table.del(null, '用户')
    await flush()

    expect(confirmMock).toHaveBeenCalledWith(expect.stringContaining('用户'), '警告', expect.any(Object))
    expect(deleteApi).toHaveBeenCalledWith([5])
    expect(successMock).toHaveBeenCalled()
    expect(listApi).toHaveBeenCalled()
  })

  it('del 取消确认时不调用删除接口', async () => {
    confirmMock.mockRejectedValue('cancel')
    const deleteApi = vi.fn()
    const table = useTable(vi.fn(), { immediate: false, deleteApi })
    table.ids.value = [1]

    await table.del()
    expect(deleteApi).not.toHaveBeenCalled()
  })
})
