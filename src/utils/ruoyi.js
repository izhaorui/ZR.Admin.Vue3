const baseURL = import.meta.env.VITE_APP_BASE_API
import dayjs from 'dayjs'
/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

/**
 * 日期格式化
 * @param {*} time
 * @param {* } pattern 'YYYY-MM-DD HH:mm:ss'
 * @returns
 */
export function parseTime(time, pattern = 'YYYY-MM-DD HH:mm:ss') {
  if (arguments.length === 0 || !time) {
    return null
  }

  return dayjs(time).format(pattern)
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

/**
 * 添加日期范围
 * @param { beginTime: '', endTime: '', page: 1} params
 * @param {*} dateRange 日期范围数组
 * @param {*} propName C#属性名首字母大写
 * @returns
 */
// 添加日期范围
export function addDateRange(params, dateRange, propName) {
  let search = params
  search = typeof search === 'object' && search !== null && !Array.isArray(search) ? search : {}
  dateRange = Array.isArray(dateRange) ? dateRange : []
  if (typeof propName === 'undefined') {
    search['beginTime'] = dateRange[0]
    search['endTime'] = dateRange[1]
  } else {
    search['begin' + propName] = dateRange[0]
    search['end' + propName] = dateRange[1]
  }
  return search
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  if (value === undefined) {
    return ''
  }
  var actions = []
  Object.keys(datas).some((key) => {
    if (datas[key].dictValue == '' + value) {
      actions.push(datas[key].dictLabel)
      return true
    }
  })
  if (actions.length === 0) {
    actions.push(value)
  }
  return actions.join('')
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  if (value === undefined) {
    return ''
  }
  var actions = []
  var currentSeparator = undefined === separator ? ',' : separator
  var temp = value.split(currentSeparator)
  Object.keys(value.split(currentSeparator)).some((val) => {
    Object.keys(datas).some((key) => {
      if (datas[key].value == '' + temp[val]) {
        actions.push(datas[key].label + currentSeparator)
      }
    })
  })
  return actions.join('').substring(0, actions.join('').length - 1)
}
// 通用下载方法
export function download(fileName) {
  // window.location.href = baseURL + "/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true;
  // window.open(baseURL + "/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true)
  window.open(baseURL + fileName)
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1
  str = str.replace(/%s/g, function () {
    var arg = args[i++]
    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') {
    return ''
  }
  return str
}

// 数据合并
export function mergeRecursive(source, target) {
  for (var p in target) {
    try {
      if (target[p].constructor == Object) {
        source[p] = mergeRecursive(source[p], target[p])
      } else {
        source[p] = target[p]
      }
    } catch (e) {
      source[p] = target[p]
    }
  }
  return source
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  let config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  var childrenListMap = {}
  var nodeIds = {}
  var tree = []

  for (let d of data) {
    let parentId = d[config.parentId]
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = []
    }
    nodeIds[d[config.id]] = d
    childrenListMap[parentId].push(d)
  }

  for (let d of data) {
    let parentId = d[config.parentId]
    if (nodeIds[parentId] == null) {
      tree.push(d)
    }
  }

  for (let t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (let c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
  }
  return tree
}
/**
 * 将自定义数据转换成字典
 * @param {*} data 数据源
 * @param {*} dictLabel dictLabel
 * @param {*} dictValue dictValue
 */
export function toDict(data, dictLabel, dictValue) {
  let config = {
    label: dictLabel || 'dictLabel',
    value: dictValue || 'dictValue'
  }

  var tree = []

  for (let d of data) {
    let label = d[config.label]
    let value = d[config.value]

    tree.push({ dictLabel: label, dictValue: value })
  }

  return tree
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    var part = encodeURIComponent(propName) + '='
    if (value !== null && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof value[key] !== 'undefined') {
            let params = propName + '[' + key + ']'
            var subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

// 返回项目路径
export function getNormalPath(p) {
  if (p.length === 0 || !p || p == 'undefined') {
    return p
  }
  let res = p.replace('//', '/')
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1)
  }
  return res
}

// 验证是否为blob格式
export async function blobValidate(data) {
  try {
    const text = await data.text()
    JSON.parse(text)
    return false
  } catch (error) {
    return true
  }
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') {
    return ''
  }
  return str
}
export function praseStrZero(str) {
  if (!str || str == 'undefined' || str == 'null') {
    console.log('zero')
    return 0
  }
  return str
}

/**
 * 字符串是否为空
 * @param {*} obj
 * @returns
 */
export function isEmpty(obj) {
  if (typeof obj == 'undefined' || obj == null || obj === '') {
    return true
  } else {
    return false
  }
}

/**
 * 查找对象的唯一键值对（比如id）去判断是否存在某个数据中
 * @param {*} arr 数组
 * @param {*} key 对象键值名
 * @param {*} val
 * @returns
 */
export function findItem(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] == val) {
      return i
    }
  }
  return -1
}

export function color16() {
  //十六进制颜色随机
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
  return color
}

/**
 * 返回星期几
 * @param {*} num
 * @returns
 */
export function getWeek(num = 0) {
  var datas = dayjs().add(num, 'day').day()
  var week = ['日', '一', '二', '三', '四', '五', '六']
  return '星期' + week[datas]
}

// 移除空字符串，null, undefined
export const delEmptyQueryNodes = (obj = {}) => {
  if (Array.isArray(obj)) {
    return obj
  }
  const params = Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined)
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: obj[key]
      }),
      {}
    )
  // console.log('过滤后参数=', params)
  return params
}
