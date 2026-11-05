import { describe, it, expect } from 'vitest'
import { normalizeFeatureFlags, hasFeature, isPermissionFeatureEnabled, isRouteFeatureEnabled } from '@/utils/tenantFeature'

describe('normalizeFeatureFlags', () => {
  it('过滤空值并统一转小写去除首尾空格', () => {
    expect(normalizeFeatureFlags([' AI ', null, 'Mall', '', undefined])).toEqual(['ai', 'mall'])
  })

  it('非数组返回空数组', () => {
    expect(normalizeFeatureFlags(undefined)).toEqual([])
    expect(normalizeFeatureFlags('ai')).toEqual([])
    expect(normalizeFeatureFlags(null)).toEqual([])
  })
})

describe('hasFeature', () => {
  it('忽略大小写与空格匹配', () => {
    expect(hasFeature(['AI', 'mall'], ' ai ')).toBe(true)
    expect(hasFeature(['ai'], 'MALL')).toBe(false)
  })

  it('未指定功能时视为启用', () => {
    expect(hasFeature([], '')).toBe(true)
    expect(hasFeature(undefined, undefined)).toBe(true)
  })
})

describe('权限与路由功能开关', () => {
  it('后端已完成过滤，前端恒返回 true', () => {
    expect(isPermissionFeatureEnabled('system:user:list', [])).toBe(true)
    expect(isRouteFeatureEnabled({ name: 'User' }, [])).toBe(true)
  })
})
