import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// unplugin-auto-import 注入的全局变量，从生成的 d.ts 读取，避免手工同步
function readAutoImportGlobals() {
  const dtsPath = path.join(rootDir, 'src/auto-import.d.ts')
  const result = {}
  if (!fs.existsSync(dtsPath)) {
    return result
  }
  const content = fs.readFileSync(dtsPath, 'utf8')
  for (const [, name] of content.matchAll(/^\s*const\s+([A-Za-z_$][\w$]*)\s*:/gm)) {
    result[name] = 'readonly'
  }
  return result
}

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'html/**',
      'src/assets/**',
      'scripts-debug/**',
      'skills/**',
      'tests/**/reports/**',
      'tests/**/coverage/**',
      'src/auto-import.d.ts',
      'src/**/*.vue3'
    ]
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...readAutoImportGlobals()
      }
    },
    rules: {
      // 存量代码规则先降级为警告，保证 lint 可增量收敛
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'no-prototype-builtins': 'warn',
      'no-constant-condition': ['warn', { checkLoops: false }],
      'no-control-regex': 'warn',
      'no-case-declarations': 'warn',
      'no-useless-assignment': 'warn',
      // 存量组件规则暂降级为警告，后续按模块逐步修复再提升为 error
      'vue/no-mutating-props': 'warn',
      'vue/no-side-effects-in-computed-properties': 'warn',
      'vue/require-valid-default-prop': 'warn',
      'vue/valid-define-emits': 'warn',
      'vue/valid-v-for': 'warn',
      'vue/require-v-for-key': 'warn',
      'vue/no-ref-as-operand': 'warn',
      'vue/no-dupe-keys': 'warn',
      'vue/require-prop-type-constructor': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/attributes-order': 'off'
    }
  },
  eslintConfigPrettier
]
