import { describe, it, expect } from 'vitest'
import {
  isHttp,
  isLink,
  isExternal,
  validUsername,
  validURL,
  validLowerCase,
  validUpperCase,
  validAlphabets,
  validEmail,
  isString,
  isArray
} from '@/utils/validate'

describe('isHttp / isLink / isExternal', () => {
  it('isHttp 识别 http 与 https', () => {
    expect(isHttp('http://a.com')).toBe(true)
    expect(isHttp('https://a.com')).toBe(true)
    expect(isHttp('/index')).toBe(false)
    expect(isHttp('')).toBe(false)
  })

  it('isLink 识别 /link 前缀', () => {
    expect(isLink('/link/a')).toBe(true)
    expect(isLink('/index')).toBe(false)
  })

  it('isExternal 识别外链协议', () => {
    expect(isExternal('https://a.com')).toBe(true)
    expect(isExternal('mailto:a@b.com')).toBe(true)
    expect(isExternal('tel:10086')).toBe(true)
    expect(isExternal('/index')).toBe(false)
  })
})

describe('validUsername', () => {
  it('仅允许白名单账号', () => {
    expect(validUsername('admin')).toBe(true)
    expect(validUsername(' editor ')).toBe(true)
    expect(validUsername('guest')).toBe(false)
  })
})

describe('validURL', () => {
  it('校验常见 URL', () => {
    expect(validURL('https://www.example.com/path?a=1')).toBe(true)
    expect(validURL('ftp://example.com')).toBe(true)
    expect(validURL('not-a-url')).toBe(false)
  })
})

describe('大小写与字母校验', () => {
  it('validLowerCase / validUpperCase / validAlphabets', () => {
    expect(validLowerCase('abc')).toBe(true)
    expect(validLowerCase('Abc')).toBe(false)
    expect(validUpperCase('ABC')).toBe(true)
    expect(validUpperCase('ABc')).toBe(false)
    expect(validAlphabets('AbC')).toBe(true)
    expect(validAlphabets('Ab1')).toBe(false)
  })
})

describe('validEmail', () => {
  it('校验邮箱格式', () => {
    expect(validEmail('a@b.com')).toBe(true)
    expect(validEmail('a.b+c@sub.example.cn')).toBe(true)
    expect(validEmail('a@b')).toBe(false)
    expect(validEmail('not-an-email')).toBe(false)
  })
})

describe('isString / isArray', () => {
  it('类型判断', () => {
    expect(isString('a')).toBe(true)
    expect(isString(new String('a'))).toBe(true)
    expect(isString(1)).toBe(false)
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
  })
})
