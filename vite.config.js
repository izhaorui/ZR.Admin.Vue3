import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import createVitePlugins from './vite/plugins'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())

  const alias = {
    // 设置路径
    '~': path.resolve(__dirname, './'),
    // 设置别名
    '@': path.resolve(__dirname, './src')
  }
  if (command === 'serve') {
    // 解决警告You are running the esm-bundler build of vue-i18n.
    alias['vue-i18n'] = 'vue-i18n/dist/vue-i18n.cjs.js'
  }
  return {
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: alias,
      // 导入时想要省略的扩展名列表
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    css: {
      devSourcemap: true //开发模式时启用
    },
    base: env.VITE_APP_ROUTER_PREFIX,
    // 打包配置
    build: {
      sourcemap: command === 'build' ? false : 'inline',
      outDir: 'dist', //指定输出目录
      assetsDir: 'assets', //指定静态资源存储目录(相对于outDir)
      chunkSizeWarningLimit: 2000, //Adjust the limit to your desired value in KB
      // 将js、css文件分离到单独文件夹
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    // vite 相关配置
    server: {
      port: 8887,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/dev-api': {
          target: env.VITE_APP_API_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, '')
        },
        '/msghub': {
          target: env.VITE_APP_API_HOST,
          ws: true,
          rewrite: (path) => path.replace(/^\/msgHub/, '')
        }
      }
    }
  }
})
