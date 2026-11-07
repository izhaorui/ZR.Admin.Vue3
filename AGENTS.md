# AGENTS.md

## Project

ZR.Admin.Vue3 是一个基于 Vue3 + Vite + Element Plus 的后台管理系统。

技术栈：

- Vue 3 (Composition API)
- Vite
- Vue Router
- Pinia
- Axios
- Element Plus
- SCSS

---

## Code Style

### Vue

- 优先使用 `<script setup>`
- 使用 Composition API，不使用 Options API
- 优先使用 `ref`、`computed`
- 不要修改全局组件，除非明确要求
- 保持已有代码风格

### JavaScript

- 使用 ES2022 语法
- 尽量使用 const
- 能不用 any 就不用 any（如果 TS）
- 不要随意增加第三方依赖

---

## UI

UI 使用 Element Plus。

新增页面保持：

- 相同按钮样式
- 相同分页组件
- 相同搜索栏
- 相同 Dialog 风格

不要修改全局主题。

---

## API

所有请求统一放在：

```
src/api
```

不要在页面直接写 axios。

保持：

```
api/
    user.js
    role.js
    dept.js
```

风格一致。

---

## Router

新增页面需要：

- 配置 Router
- 配置菜单
- 保持与已有模块一致

不要修改已有路由结构。

---

## State

全局状态使用 Pinia。

不要把全局状态放到 window。

---

## Components

公共组件放：

```
src/components
```

页面私有组件放：

```
views/xxx/components
```

不要复制已有组件，优先复用。

---

## Styles

样式：

- 优先 scoped
- 使用 SCSS
- 尽量不要使用 !important
- 不修改 Element Plus 默认变量

---

## Icons

优先使用：

- Element Plus Icons

不要引入新的 Icon Library。

---

## Folder Rules

页面：

```
views/system/user
```

一个页面建议：

```
index.vue
components/
api.js（如果已有规范）
```

保持已有目录结构。

---

## Before Modifying Code

修改代码前：

1. 阅读相关模块
2. 保持命名风格一致
3. 不要做无关重构
4. 不修改不相关文件

---

## Response Rules

Agent 修改代码时：

- 优先最小修改
- 保持向后兼容
- 不删除已有功能
- 不随意修改接口字段
- 不修改数据库结构（除非明确要求）

如果存在多个实现方案：

优先：

1. 与当前项目一致
2. 可维护性
3. 性能
4. 可读性

---

## Output Requirements

生成代码时：

- 保持现有格式
- 不增加无关注释
- 不输出示例代码，直接修改项目代码
- 不创建重复组件
- 修改完成后说明影响范围

## Backend Convention

后端接口统一返回：

{
code: 200,
msg: "",
data: {}
}

code == 200 表示成功。

---

## Permission

页面权限：

v-hasPermi

按钮权限：

permission 字段控制。

不要删除权限控制。

---

## Table

所有列表：

- 支持分页
- 支持刷新
- 支持 loading
- 支持搜索

保持与已有页面一致。

### 表格组件选型

默认使用 Element Plus `el-table`：

- 后台管理常规列表、分页列表、树形选择
- 数据量受分页约束，单页通常不超过 500 行

仅以下场景使用 `vxe-table`：

- 需要虚拟滚动（单次渲染上千行，如无分页的全量树、日志流）
- 需要 vxe 专有能力（行编辑、列拖拽、跨页选中、聚合汇总）

约束：

- 新页面不得为“功能更全”而引入 `vxe-table`，只有满足上述条件才用
- 已用 `el-table` 的页面不因本规范回改
- `vxe-table` 由 `src/vxe-tb.js` 全局注册，历史例外只有 `system/menu`（树形表，迁移需单独评估）

---

## Form

新增表单：

- Element Plus Form
- 使用 rules 校验
- Dialog 关闭时 resetFields()

---

## Quality Gate

修改代码后：

- `npm run lint` 必须 0 error（存量 warning 逐步收敛，不新增）
- `npm run test` 必须全绿；纯逻辑改动需补 `tests/unit` 用例
- 提交时 husky `pre-commit` 会对暂存文件执行 `eslint --fix` + `prettier --write`
- 新代码遵循 `.prettierrc.cjs`（单引号、无分号、printWidth 148）
- CI 会依次执行 `npm ci`、`npm run lint`、`npm run test`、`npm run build:prod`，本地先跑通再提交

---

## Security

- 后端维护的富文本（公告、文章等）用 `v-safe-html` 渲染，禁止直接用 `v-html`
- 新增外链需带 `rel="noopener noreferrer"`

---

## Don't

不要：

- 随意修改 eslint.config.js（调整规则需说明原因）
- 修改 vite.config
- 随意修改 package.json（新增依赖需说明原因）
- 修改全局样式
- 引入新的 UI 框架
