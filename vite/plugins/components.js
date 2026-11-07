import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default function createComponents() {
  return Components({
    dts: false,
    dirs: [],
    resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
  })
}
