import { beforeEach, describe, expect, it } from 'vitest'
import { extractHistoryUrls, useImageHistory } from '@/components/ImageSelector/composables/useImageHistory'
import { joinFileName, splitFileName } from '@/components/ImageSelector/utils/fileName'

describe('ImageSelector private modules', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps file extension handling consistent for rename operations', () => {
    expect(splitFileName('photo.JPG', '.jpg')).toEqual({ name: 'photo', ext: 'jpg' })
    expect(splitFileName('archive.tar.gz', '')).toEqual({ name: 'archive.tar', ext: 'gz' })
    expect(joinFileName(' photo ', 'jpg')).toBe('photo.jpg')
    expect(joinFileName('', 'jpg')).toBe('')
  })

  it('deduplicates, removes, and clears stored selection history', () => {
    const history = useImageHistory()

    history.saveSelectionHistory(['first', 'second'])
    history.saveSelectionHistory(['second', 'third'])

    expect(history.recentUsedImages.value).toEqual(['second', 'third', 'first'])
    expect(extractHistoryUrls(JSON.parse(window.localStorage.getItem('imageSelectorHistory')))).toEqual(['second', 'third', 'first'])

    expect(history.removeFromHistory('second')).toBe(true)
    expect(history.recentUsedImages.value).toEqual(['third', 'first'])

    history.clearHistory()
    expect(history.recentUsedImages.value).toEqual([])
    expect(window.localStorage.getItem('imageSelectorHistory')).toBeNull()
  })
})
