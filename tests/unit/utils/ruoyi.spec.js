import { describe, it, expect } from 'vitest'
import {
  addDateRange,
  handleTree,
  selectDictLabel,
  selectDictLabels,
  toDict,
  tansParams,
  getNormalPath,
  isEmpty,
  findItem,
  parseStrEmpty,
  sprintf,
  mergeRecursive,
  blobValidate
} from '@/utils/ruoyi'

describe('addDateRange', () => {
  it('默认使用 beginTime / endTime 展开日期区间', () => {
    const params = { pageNum: 1 }
    expect(addDateRange(params, ['2024-01-01', '2024-01-31'])).toEqual({
      pageNum: 1,
      beginTime: '2024-01-01',
      endTime: '2024-01-31'
    })
  })

  it('传入 propName 时按前缀拼接', () => {
    expect(addDateRange({}, ['2024-01-01', '2024-01-31'], 'Time')).toEqual({
      beginTime: '2024-01-01',
      endTime: '2024-01-31'
    })
  })

  it('非对象参数与非法日期区间降级为空值', () => {
    expect(addDateRange(null, null)).toEqual({ beginTime: undefined, endTime: undefined })
    expect(addDateRange([], [])).toEqual({ beginTime: undefined, endTime: undefined })
  })
})

describe('selectDictLabel / selectDictLabels', () => {
  const dicts = [
    { dictValue: '0', dictLabel: '正常' },
    { dictValue: '1', dictLabel: '停用' }
  ]

  it('命中字典返回标签', () => {
    expect(selectDictLabel(dicts, 0)).toBe('正常')
    expect(selectDictLabel(dicts, '1')).toBe('停用')
  })

  it('未命中返回原值，undefined 返回空串', () => {
    expect(selectDictLabel(dicts, '9')).toBe('9')
    expect(selectDictLabel(dicts, undefined)).toBe('')
  })

  it('多值字典按分隔符拼接，且不保留末尾分隔符', () => {
    const list = [
      { value: 'a', label: '甲' },
      { value: 'b', label: '乙' }
    ]
    expect(selectDictLabels(list, 'a,b')).toBe('甲,乙')
    expect(selectDictLabels(list, undefined)).toBe('')
  })
})

describe('handleTree', () => {
  it('按 parentId 组装树，根节点保留在顶层', () => {
    const data = [
      { id: 1, parentId: 0, name: '总部' },
      { id: 2, parentId: 1, name: '研发部' },
      { id: 3, parentId: 1, name: '测试部' },
      { id: 4, parentId: 2, name: '前端组' }
    ]
    const tree = handleTree(data, 'id', 'parentId')
    expect(tree).toHaveLength(1)
    expect(tree[0].children.map((i) => i.name)).toEqual(['研发部', '测试部'])
    expect(tree[0].children[0].children[0].name).toBe('前端组')
  })

  it('支持自定义字段名与空数据', () => {
    const data = [{ key: 'a', pid: null }]
    expect(handleTree(data, 'key', 'pid')).toHaveLength(1)
    expect(handleTree([])).toEqual([])
  })
})

describe('toDict', () => {
  it('默认字段转换为 dictLabel / dictValue', () => {
    expect(toDict([{ dictLabel: '是', dictValue: 'Y' }])).toEqual([{ dictLabel: '是', dictValue: 'Y' }])
  })

  it('支持自定义 label/value 字段', () => {
    expect(toDict([{ name: '是', code: 'Y' }], 'name', 'code')).toEqual([{ dictLabel: '是', dictValue: 'Y' }])
  })
})

describe('tansParams', () => {
  it('拼接普通参数并对键值编码', () => {
    expect(tansParams({ name: 'a b', pageNum: 1 })).toBe('name=a%20b&pageNum=1&')
  })

  it('对象参数展开为 key[sub] 形式', () => {
    expect(tansParams({ params: { beginTime: '2024-01-01' } })).toBe('params%5BbeginTime%5D=2024-01-01&')
  })

  it('跳过 null / undefined', () => {
    expect(tansParams({ a: null, b: undefined, c: 1 })).toBe('c=1&')
  })
})

describe('getNormalPath', () => {
  it('合并重复斜杠并去掉末尾斜杠', () => {
    expect(getNormalPath('/a//b/')).toBe('/a/b')
    expect(getNormalPath('/a/b')).toBe('/a/b')
  })

  it('空值原样返回', () => {
    expect(getNormalPath('')).toBe('')
    expect(getNormalPath('undefined')).toBe('undefined')
  })
})

describe('isEmpty / findItem / parseStrEmpty', () => {
  it('isEmpty 识别空值', () => {
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty('a')).toBe(false)
  })

  it('findItem 返回匹配下标，未命中返回 -1', () => {
    const arr = [{ id: 1 }, { id: 2 }]
    expect(findItem(arr, 'id', 2)).toBe(1)
    expect(findItem(arr, 'id', 3)).toBe(-1)
  })

  it('parseStrEmpty 将 undefined / null 字符串转为空串', () => {
    expect(parseStrEmpty('undefined')).toBe('')
    expect(parseStrEmpty('null')).toBe('')
    expect(parseStrEmpty('ok')).toBe('ok')
  })
})

describe('sprintf', () => {
  it('依次替换 %s', () => {
    expect(sprintf('%s-%s', 'a', 'b')).toBe('a-b')
  })

  it('参数不足返回空串', () => {
    expect(sprintf('%s-%s', 'a')).toBe('')
  })
})

describe('mergeRecursive', () => {
  it('递归合并对象且不丢失原字段', () => {
    const source = { a: 1, nested: { x: 1 } }
    const result = mergeRecursive(source, { b: 2, nested: { y: 2 } })
    expect(result).toEqual({ a: 1, b: 2, nested: { x: 1, y: 2 } })
  })
})

describe('blobValidate', () => {
  it('JSON 响应视为错误信息，返回 false', async () => {
    const blob = new Blob([JSON.stringify({ code: 500, msg: 'err' })])
    await expect(blobValidate(blob)).resolves.toBe(false)
  })

  it('非 JSON 内容视为正常文件流，返回 true', async () => {
    const blob = new Blob(['PK\u0003\u0004binary'])
    await expect(blobValidate(blob)).resolves.toBe(true)
  })
})
