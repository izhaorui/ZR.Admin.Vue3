import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    // 与 vite/plugins/auto-import.js 保持一致，测试环境同样注入 ref/reactive 等全局 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.js'],
    setupFiles: ['tests/unit/setup.js'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/unit/coverage',
      include: ['src/utils/**/*.js', 'src/composables/**/*.js'],
      exclude: ['src/utils/request.js', 'src/utils/ruoyi.js'],
      reporter: ['text', 'html']
    }
  }
})
