import createDOMPurify from 'dompurify'

const RICH_TEXT_CONFIG = {
  ADD_ATTR: ['target'],
  // 保留富文本编辑器产出的常见标签样式，同时由 DOMPurify 过滤危险 CSS
  ALLOW_DATA_ATTR: true
}

let purifier = null

function getPurifier() {
  if (purifier) return purifier
  // dompurify v3 在存在 window 时默认导出即为实例，Node 环境需要通过工厂创建
  purifier = typeof createDOMPurify.sanitize === 'function' ? createDOMPurify : createDOMPurify(window)
  purifier.addHook('afterSanitizeAttributes', (node) => {
    // 外链跳转统一补 noopener，避免 window.opener 被利用
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
  return purifier
}

/**
 * 净化富文本 HTML，用于后端维护的公告、文章等 v-html 渲染内容
 * @param {string} html 原始 HTML
 * @returns {string} 去除脚本、事件属性与危险 URL 后的 HTML
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string' || html === '') {
    return ''
  }
  return getPurifier().sanitize(html, RICH_TEXT_CONFIG)
}

export default sanitizeHtml
