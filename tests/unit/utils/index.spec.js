import { describe, it, expect } from 'vitest'
import {
  cleanArray,
  param,
  param2Obj,
  getQueryObject,
  html2Text,
  objectMerge,
  deepClone,
  uniqueArr,
  makeMap,
  titleCase,
  camelCase,
  isNumberStr,
  getLightColor,
  hexToRgb,
  rgbToHex,
  prettyJsonText,
  resolveRedirectTarget,
  formatTime,
  showTime
} from '@/utils/index'

describe('cleanArray / param / param2Obj', () => {
  it('cleanArray 过滤假值', () => {
    expect(cleanArray([1, 0, null, 'a', '', undefined])).toEqual([1, 'a'])
  })

  it('param 编码键值并跳过 undefined', () => {
    expect(param({ a: 'x y', b: undefined, c: 1 })).toBe('a=x%20y&c=1')
    expect(param(null)).toBe('')
  })

  it('param2Obj 解析查询串', () => {
    expect(param2Obj('http://a.com?x=1&y=hello%20world')).toEqual({ x: '1', y: 'hello world' })
    expect(param2Obj('http://a.com')).toEqual({})
  })
})

describe('getQueryObject', () => {
  it('解析 URL 查询参数', () => {
    expect(getQueryObject('http://a.com?x=1&y=2')).toEqual({ x: '1', y: '2' })
    expect(getQueryObject('http://a.com')).toEqual({})
  })
})

describe('html2Text', () => {
  it('提取纯文本', () => {
    expect(html2Text('<p>a<b>b</b></p>')).toBe('ab')
  })
})

describe('objectMerge / deepClone', () => {
  it('objectMerge 递归合并且后者优先', () => {
    const target = { a: 1, nested: { x: 1 } }
    expect(objectMerge(target, { b: 2, nested: { y: 2 } })).toEqual({ a: 1, b: 2, nested: { x: 1, y: 2 } })
  })

  it('objectMerge 遇到数组返回浅拷贝', () => {
    const source = [1, 2]
    const result = objectMerge({}, source)
    expect(result).toEqual([1, 2])
    expect(result).not.toBe(source)
  })

  it('deepClone 深拷贝对象与数组，且不共享引用', () => {
    const source = { a: 1, nested: { b: 2 }, list: [{ c: 3 }] }
    const copy = deepClone(source)
    expect(copy).toEqual(source)
    expect(copy.nested).not.toBe(source.nested)
    expect(copy.list[0]).not.toBe(source.list[0])
    expect(deepClone([1, 2])).toEqual([1, 2])
  })
})

describe('uniqueArr', () => {
  it('去重并保持顺序', () => {
    expect(uniqueArr([3, 1, 3, 2, 1])).toEqual([3, 1, 2])
  })
})

describe('makeMap / titleCase / camelCase', () => {
  it('makeMap 生成匹配函数', () => {
    const isFruit = makeMap('apple,banana')
    expect(isFruit('apple')).toBe(true)
    expect(isFruit('pear')).toBeFalsy()
    const isLowerFruit = makeMap('apple,banana', true)
    expect(isLowerFruit('APPLE')).toBe(true)
  })

  it('titleCase 首字母大写', () => {
    expect(titleCase('hello world')).toBe('Hello World')
  })

  it('camelCase 下划线转驼峰', () => {
    expect(camelCase('hello_world_test')).toBe('helloWorldTest')
  })
})

describe('isNumberStr', () => {
  it('识别合法数字字符串', () => {
    expect(isNumberStr('123')).toBe(true)
    expect(isNumberStr('-1.5')).toBe(true)
    expect(isNumberStr('+0')).toBe(true)
    expect(isNumberStr('01')).toBe(false)
    expect(isNumberStr('abc')).toBe(false)
  })
})

describe('颜色转换', () => {
  it('hexToRgb 解析六位色值', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0])
    expect(hexToRgb('ff0000')).toEqual([255, 0, 0])
    expect(hexToRgb('red')).toBe('red')
  })

  it('rgbToHex 补零并校验入参', () => {
    expect(rgbToHex(255, 0, 15)).toBe('#ff000f')
    expect(rgbToHex(1000, 0, 0)).toBe('')
  })

  it('getLightColor 按比例变浅，非法色值原样返回', () => {
    expect(getLightColor('#000000', 0.5)).toBe('#7f7f7f')
    expect(getLightColor('bad-color', 0.5)).toBe('bad-color')
  })
})

describe('prettyJsonText', () => {
  it('对象格式化为两空格缩进 JSON', () => {
    expect(prettyJsonText({ a: 1 })).toBe('{\n  "a": 1\n}')
  })

  it('空值返回空串，嵌套 JSON 字符串递归格式化', () => {
    expect(prettyJsonText(null)).toBe('')
    expect(prettyJsonText(undefined)).toBe('')
    expect(prettyJsonText('{"a":1}')).toBe('{\n  "a": 1\n}')
    expect(prettyJsonText('"{\\"a\\":1}"')).toBe('{\n  "a": 1\n}')
    expect(prettyJsonText('a=1&b=2')).toBe('{\n  "a": "1",\n  "b": "2"\n}')
    expect(prettyJsonText('plain text')).toBe('plain text')
  })
})

describe('resolveRedirectTarget', () => {
  it('空值走兜底路径', () => {
    expect(resolveRedirectTarget('')).toEqual({ path: '/' })
    expect(resolveRedirectTarget(null, '/index')).toEqual({ path: '/index' })
  })

  it('纯路径返回 path 对象，带 query 的整串原样返回', () => {
    expect(resolveRedirectTarget('/system/user')).toEqual({ path: '/system/user' })
    expect(resolveRedirectTarget(' /sso/authorize?id=1 ')).toBe('/sso/authorize?id=1')
  })
})

describe('formatTime / showTime', () => {
  it('formatTime 输出相对时间', () => {
    expect(formatTime(Date.now())).toBe('刚刚')
    expect(formatTime(Date.now() - 5 * 60 * 1000)).toBe('5分钟前')
    expect(formatTime(Date.now() - 26 * 3600 * 1000)).toBe('1天前')
  })

  it('showTime 同年只显示月日时分', () => {
    const now = new Date()
    expect(showTime(now.getTime())).toBe(
      `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    )
  })
})
