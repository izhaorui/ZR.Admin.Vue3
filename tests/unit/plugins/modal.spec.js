import { beforeEach, describe, expect, it, vi } from 'vitest'

const box = {
  alert: vi.fn(),
  confirm: vi.fn(),
  prompt: vi.fn()
}

vi.mock('element-plus', () => ({
  ElMessage: Object.assign(vi.fn(), { info: vi.fn(), error: vi.fn(), success: vi.fn(), warning: vi.fn() }),
  ElMessageBox: box,
  ElNotification: { info: vi.fn(), error: vi.fn(), success: vi.fn(), warning: vi.fn() },
  ElLoading: { service: vi.fn(() => ({ close: vi.fn() })) }
}))

async function loadModal() {
  vi.resetModules()
  Object.values(box).forEach((fn) => fn.mockReset())
  const { default: modal } = await import('@/plugins/modal')
  return modal
}

describe('modal 插件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('confirm 支持 (content) 简写，标题与按钮文案使用默认值', async () => {
    const modal = await loadModal()
    box.confirm.mockResolvedValue('confirm')

    await modal.confirm('确认删除？')

    expect(box.confirm).toHaveBeenCalledWith(
      '确认删除？',
      '系统提示',
      expect.objectContaining({ confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    )
  })

  it('confirm 支持老页面的 (content, title, options) 写法', async () => {
    const modal = await loadModal()
    box.confirm.mockResolvedValue('confirm')

    await modal.confirm('是否确认删除？', '警告', { type: 'error', confirmButtonText: '删' })

    expect(box.confirm).toHaveBeenCalledWith(
      '是否确认删除？',
      '警告',
      expect.objectContaining({ type: 'error', confirmButtonText: '删', cancelButtonText: '取消' })
    )
  })

  it('取消弹框时 resolve 而不是 reject，避免老页面 .then() 产生未捕获拒绝', async () => {
    const modal = await loadModal()
    box.confirm.mockRejectedValue('cancel')

    await expect(modal.confirm('确认？')).resolves.toBeUndefined()
  })

  it('alert / prompt 同样兼容两参、三参写法', async () => {
    const modal = await loadModal()
    box.alert.mockResolvedValue('confirm')
    box.prompt.mockResolvedValue({ value: 'x' })

    await modal.alert('提示内容')
    expect(box.alert).toHaveBeenCalledWith('提示内容', '系统提示', expect.objectContaining({ type: 'info' }))

    await modal.alertSuccess('保存成功', '结果')
    expect(box.alert).toHaveBeenCalledWith('保存成功', '结果', expect.objectContaining({ type: 'success' }))

    await modal.prompt('请输入名称')
    expect(box.prompt).toHaveBeenCalledWith('请输入名称', '系统提示', expect.objectContaining({ type: 'warning' }))
  })

  it('alert 被取消时也不抛错', async () => {
    const modal = await loadModal()
    box.alert.mockRejectedValue('cancel')
    box.prompt.mockRejectedValue('cancel')

    await expect(modal.alert('x')).resolves.toBeUndefined()
    await expect(modal.prompt('x')).resolves.toBeUndefined()
  })
})
