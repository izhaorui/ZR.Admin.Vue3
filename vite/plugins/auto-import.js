import autoImport from 'unplugin-auto-import/vite'

export default function createAutoImport() {
  return autoImport({
    imports: [
      'vue',
      'vue-router',
      {
        'vuex': ['useStore']
      }
    ],
    dts: "src/auto-import.d.ts" // 生成 `auto-import.d.ts` 全局声明
  })
}