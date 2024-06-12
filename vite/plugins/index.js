import vue from '@vitejs/plugin-vue'

import createAutoImport from './auto-import'
import createSvgIcon from './svg-icon'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
// import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import'
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import'

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue()]
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createSetupExtend())
  vitePlugins.push(createSvgIcon(isBuild))
  isBuild && vitePlugins.push(...createCompression(viteEnv))

  // vitePlugins.push(
  //   createStyleImportPlugin({
  //     resolves: [VxeTableResolve()]
  //   })
  // )

  // Vxe 按需导入
  vitePlugins.push(
    lazyImport({
      resolvers: [
        VxeResolver({
          libraryName: 'vxe-table'
        }),
        VxeResolver({
          libraryName: 'vxe-pc-ui'
        })
      ]
    })
  )
  return vitePlugins
}
