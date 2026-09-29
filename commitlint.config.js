/**
 * 提交信息规范（只约束新提交，历史提交不改写）
 *
 * 格式：:emoji:(scope) 描述
 *   :sparkles:(shopping,skus) SKU 规格组合改为只读
 *   :bug:(order) 修正订单详情页详细地址取不到值
 *   - emoji 用 gitmoji 短代码
 *   - scope 可选，多个用逗号分隔，一律小写
 *   - 描述用中文，动词开头，不加句号
 *
 * 校验时机：git commit 时由 .husky/commit-msg 自动执行
 * 手动校验某条消息： npx commitlint --edit <消息文件>
 *
 * 注：本仓库 package.json 声明了 "type": "module"，因此这里用 ESM 的 export default。
 */
export default {
  extends: ['gitmoji'],
  rules: {
    // 关闭预设自带的 start-with-gitmoji：它要求 emoji 后紧跟空格（`:bug: xxx`），
    // 与本仓库 `:bug:(scope) xxx` 的写法冲突，会把合法提交误判成"没用 gitmoji"。
    // 改用下面的 type-empty + type-enum 达成同样效果：没写 emoji 时 headerPattern 解析不出 type，直接被拒。
    'start-with-gitmoji': [0],

    // 必须以 gitmoji 开头（能拦住纯 conventional 的 `fix(xxx): xxx` 与原生 emoji 的 `🎨 xxx`）
    'type-empty': [2, 'never'],

    // 允许使用的 gitmoji
    'type-enum': [
      2,
      'always',
      [
        // —— 基础常用 ——
        'bug', // 🐛 修复 bug
        'sparkles', // ✨ 新功能
        'zap', // ⚡ 优化性能
        'pencil', // 📝 写文档
        'art', // 🎨 结构改进 / 格式化代码
        'fire', // 🔥 删除代码或文档
        'arrow_up', // ⬆️ 升级依赖
        'twisted_rightwards_arrows', // 🔀 合并分支
        'truck', // 🚚 文件移动或重命名
        'card_file_box', // 🗃️ 数据库相关改动
        // —— 补充：历史提交中已在用，语义明确 ——
        'recycle', // ♻️ 重构 / 清理废弃代码
        'lock', // 🔒 安全相关修复
        'wrench', // 🔧 配置、构建、gitignore 等杂项
      ],
    ],

    'type-case': [2, 'always', 'lower-case'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    // 描述结尾不加句号。commitlint 只能配置一个字符，这里按中文提交为主场景配中文句号
    'subject-full-stop': [2, 'never', '。'],
    'header-max-length': [2, 'always', 100],
  },

  // 预设默认要求 `:emoji: type(scope): subject`（emoji 后还要跟 feat/fix 之类的词），
  // 与本仓库实际使用的 `:emoji:(scope) 描述` 不同，因此覆盖解析规则。
  parserPreset: {
    parserOpts: {
      headerPattern: /^:(\w+):(?:\(([^)]*)\))?\s*(.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
}
