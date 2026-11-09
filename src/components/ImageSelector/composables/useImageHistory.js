import { ref } from 'vue'

const HISTORY_STORAGE_KEY = 'imageSelectorHistory'
const HISTORY_MAX_COUNT = 20

export const extractHistoryUrls = (history) => {
  const allImages = new Map()
  history.forEach((record) => {
    if (!Array.isArray(record?.urls)) return
    record.urls.forEach((url) => {
      if (url && !allImages.has(url)) {
        allImages.set(url, true)
      }
    })
  })
  return Array.from(allImages.keys())
}

export function useImageHistory(storage = window.localStorage) {
  const recentUsedImages = ref([])

  const parseHistory = () => {
    try {
      const history = JSON.parse(storage.getItem(HISTORY_STORAGE_KEY) || '[]')
      return Array.isArray(history) ? history : []
    } catch (error) {
      console.warn('读取历史记录失败:', error)
      return []
    }
  }

  const loadSelectionHistory = () => {
    recentUsedImages.value = extractHistoryUrls(parseHistory())
  }

  const saveSelectionHistory = (urls) => {
    try {
      let history = parseHistory()
      history.unshift({
        timestamp: new Date().toISOString(),
        urls,
        count: urls.length
      })
      history = history.slice(0, HISTORY_MAX_COUNT)
      storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
      recentUsedImages.value = extractHistoryUrls(history)
    } catch (error) {
      console.warn('保存选择历史记录失败:', error)
    }
  }

  const removeFromHistory = (url) => {
    try {
      const history = parseHistory().map((record) => ({
        ...record,
        urls: record.urls ? record.urls.filter((item) => item !== url) : []
      }))
      storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
      loadSelectionHistory()
      return true
    } catch (error) {
      console.warn('移除历史记录失败:', error)
      return false
    }
  }

  const clearHistory = () => {
    storage.removeItem(HISTORY_STORAGE_KEY)
    recentUsedImages.value = []
  }

  return {
    clearHistory,
    loadSelectionHistory,
    recentUsedImages,
    removeFromHistory,
    saveSelectionHistory
  }
}
