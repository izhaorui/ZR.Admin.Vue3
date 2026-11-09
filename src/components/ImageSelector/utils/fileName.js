export const splitFileName = (realName, fileExt) => {
  const raw = String(realName || '').trim()
  const ext = String(fileExt || '')
    .replace(/^\./, '')
    .trim()

  if (ext && raw.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
    return { name: raw.slice(0, -(ext.length + 1)), ext }
  }

  const lastDot = raw.lastIndexOf('.')
  if (lastDot > 0) {
    return { name: raw.slice(0, lastDot), ext: ext || raw.slice(lastDot + 1) }
  }

  return { name: raw, ext }
}

export const joinFileName = (name, ext) => {
  const stem = String(name || '').trim()
  if (!stem) return ''
  return ext ? `${stem}.${ext}` : stem
}
