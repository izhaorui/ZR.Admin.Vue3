import { describe, it, expect } from 'vitest'
import { h, nextTick, ref, withDirectives } from 'vue'
import { mount } from '@vue/test-utils'
import safeHtml from '@/directive/module/safeHtml'

function mountWithSafeHtml(initial) {
  const html = ref(initial)
  const wrapper = mount({
    setup() {
      return () => withDirectives(h('div', { class: 'target' }), [[safeHtml, html.value]])
    }
  })
  return { wrapper, html }
}

describe('v-safe-html 指令', () => {
  it('挂载时渲染净化后的 HTML', () => {
    const { wrapper } = mountWithSafeHtml('<p>正文</p><script>alert(1)</script>')
    expect(wrapper.find('.target').element.innerHTML).toBe('<p>正文</p>')
  })

  it('内容更新时重新净化', async () => {
    const { wrapper, html } = mountWithSafeHtml('<p>一</p>')
    expect(wrapper.find('.target').element.innerHTML).toBe('<p>一</p>')

    html.value = '<img src="x.png" onerror="alert(1)">'
    await nextTick()
    expect(wrapper.find('.target').element.innerHTML).not.toContain('onerror')
  })
})
