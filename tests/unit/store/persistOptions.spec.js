import { beforeEach, describe, expect, it, vi } from 'vitest'

// 每次重置模块：tagsView 的持久化开关在模块加载时读取 localStorage，
// 这里让 vue / pinia / 插件 / store 都从同一份新注册表导入，避免出现两个 pinia 实例。
// 插件必须先装进 Vue 应用（app.use(pinia)）才会真正生效，否则会滞留在待安装队列。
async function createStore(modulePath) {
  vi.resetModules()
  const { createApp } = await import('vue')
  const { createPinia, setActivePinia } = await import('pinia')
  const { default: persistedstate } = await import('pinia-plugin-persistedstate')
  const { default: useStore } = await import(modulePath)
  const pinia = createPinia()
  pinia.use(persistedstate)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return useStore(pinia)
}

describe('store 持久化配置（pinia-plugin-persistedstate v4）', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('开启标签页持久化时只写入 pick 指定的 visitedViews', async () => {
    localStorage.setItem('layout-setting', JSON.stringify({ tagsViewPersist: true }))
    const store = await createStore('@/store/modules/tagsView')

    store.visitedViews = [{ path: '/index' }]
    store.cachedViews = ['Index']
    store.$persist()

    const persisted = JSON.parse(localStorage.getItem('tagsView'))
    expect(Object.keys(persisted)).toEqual(['visitedViews'])
    expect(persisted.visitedViews).toEqual([{ path: '/index' }])
  })

  it('关闭标签页持久化时不写入任何内容', async () => {
    localStorage.setItem('layout-setting', JSON.stringify({ tagsViewPersist: false }))
    const store = await createStore('@/store/modules/tagsView')

    store.visitedViews = [{ path: '/index' }]
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(localStorage.getItem('tagsView')).toBeNull()
  })
})
