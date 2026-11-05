import { sanitizeHtml } from '@/utils/sanitize'

/**
 * v-safe-html：对富文本内容做 XSS 净化后再写入 innerHTML
 * 用于后端可维护的公告、文章等场景，替代直接使用 v-html
 */
export default {
  mounted(el, binding) {
    el.innerHTML = sanitizeHtml(binding.value)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.innerHTML = sanitizeHtml(binding.value)
    }
  }
}
