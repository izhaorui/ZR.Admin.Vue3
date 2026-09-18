export function getTopMenuActivePath(route) {
  if (!route) return ''
  if (route.meta?.activeMenu) return route.meta.activeMenu

  const path = route.path || ''
  if (path === '/index' || path === '/user/profile') return path

  const segments = path.split('/').filter(Boolean)
  return segments.length > 1 ? `/${segments[0]}` : path
}

export function parseRouteQuery(query) {
  if (!query) return null
  if (typeof query === 'object') return query
  if (typeof query !== 'string') return null

  const source = query.trim()
  if (!source) return null

  try {
    return JSON.parse(source)
  } catch {
    try {
      const normalized = source.replace(/([{,]\s*)([A-Za-z_$][\w$-]*)\s*:/g, '$1"$2":').replace(/'/g, '"')
      return JSON.parse(normalized)
    } catch {
      return null
    }
  }
}
