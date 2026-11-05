import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@/utils/sanitize'

describe('sanitizeHtml', () => {
  it('移除 script 标签与内容', () => {
    const result = sanitizeHtml('<p>正文</p><script>alert(1)</script>')
    expect(result).toBe('<p>正文</p>')
  })

  it('移除内联事件属性', () => {
    const result = sanitizeHtml('<img src="x.png" onerror="alert(1)">')
    expect(result).not.toContain('onerror')
    expect(result).toContain('src="x.png"')
  })

  it('移除 javascript: 协议链接', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">点我</a>')
    expect(result).not.toContain('javascript:')
  })

  it('保留富文本常规标签与样式', () => {
    const html = '<h3>标题</h3><p style="color: red"><strong>加粗</strong></p><ul><li>项</li></ul>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('target=_blank 的外链自动补 rel', () => {
    const result = sanitizeHtml('<a href="https://example.com" target="_blank">外链</a>')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it('空值与非字符串返回空串', () => {
    expect(sanitizeHtml('')).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(123)).toBe('')
  })
})
