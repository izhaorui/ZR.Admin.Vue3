import { compress } from 'compresso.js'

const COMPRESSIBLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_COMPRESSION_THRESHOLD = 1024 * 1024

export async function compressImage(file, quality) {
  const normalizedQuality = Number(quality)
  if (
    file.size <= IMAGE_COMPRESSION_THRESHOLD ||
    !Number.isFinite(normalizedQuality) ||
    normalizedQuality <= 0 ||
    !COMPRESSIBLE_IMAGE_TYPES.includes(file.type)
  ) {
    return file
  }

  const outputFormat = file.type === 'image/png' ? 'webp' : file.type.split('/')[1]
  const result = await compress(file, {
    quality: Math.min(normalizedQuality, 100) / 100,
    format: outputFormat,
    maxWidth: Infinity,
    maxHeight: Infinity
  })

  if (result.file.size >= file.size) return file
  return result.file
}
