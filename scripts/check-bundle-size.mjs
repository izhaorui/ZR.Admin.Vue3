import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const distDir = path.resolve(process.cwd(), 'dist')
const mib = 1024 * 1024
const budgets = {
  assetBytes: 11 * mib,
  cssBytes: 1.2 * mib,
  echartsBytes: 0.8 * mib,
  javascriptBytes: 9 * mib,
  largestJavaScriptBytes: 1.8 * mib
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(directory, entry.name)
      return entry.isDirectory() ? listFiles(filePath) : [{ filePath, size: (await stat(filePath)).size }]
    })
  )
  return files.flat()
}

function formatBytes(bytes) {
  return `${(bytes / mib).toFixed(2)} MiB`
}

function fail(message) {
  console.error(`Bundle budget exceeded: ${message}`)
  process.exitCode = 1
}

let files
try {
  files = await listFiles(distDir)
} catch (error) {
  if (error?.code === 'ENOENT') {
    console.error('Bundle budget check requires an existing dist directory. Run npm run build:prod first.')
    process.exitCode = 1
  } else {
    throw error
  }
}

if (files) {
  const assets = files.map(({ filePath, size }) => ({
    path: path.relative(distDir, filePath).replaceAll(path.sep, '/'),
    size
  }))
  const uncompressedAssets = assets.filter((asset) => !/\.(?:gz|br)$/.test(asset.path))
  const javascript = uncompressedAssets.filter((asset) => asset.path.endsWith('.js'))
  const styles = uncompressedAssets.filter((asset) => asset.path.endsWith('.css'))
  const assetBytes = uncompressedAssets.reduce((total, asset) => total + asset.size, 0)
  const javascriptBytes = javascript.reduce((total, asset) => total + asset.size, 0)
  const cssBytes = styles.reduce((total, asset) => total + asset.size, 0)
  const largestJavaScript = javascript.reduce((largest, asset) => (asset.size > largest.size ? asset : largest), { path: '', size: 0 })
  const echartsAssets = javascript.filter((asset) => path.basename(asset.path).startsWith('echarts-'))

  console.log(`All uncompressed assets: ${formatBytes(assetBytes)} / ${formatBytes(budgets.assetBytes)}`)
  console.log(`JavaScript: ${formatBytes(javascriptBytes)} / ${formatBytes(budgets.javascriptBytes)}`)
  console.log(`CSS: ${formatBytes(cssBytes)} / ${formatBytes(budgets.cssBytes)}`)
  console.log(`Largest JavaScript asset: ${largestJavaScript.path} (${formatBytes(largestJavaScript.size)})`)

  if (assetBytes > budgets.assetBytes) {
    fail(`all uncompressed assets are ${formatBytes(assetBytes)} (limit ${formatBytes(budgets.assetBytes)})`)
  }
  if (javascriptBytes > budgets.javascriptBytes) {
    fail(`JavaScript is ${formatBytes(javascriptBytes)} (limit ${formatBytes(budgets.javascriptBytes)})`)
  }
  if (cssBytes > budgets.cssBytes) {
    fail(`CSS is ${formatBytes(cssBytes)} (limit ${formatBytes(budgets.cssBytes)})`)
  }
  if (largestJavaScript.size > budgets.largestJavaScriptBytes) {
    fail(`${largestJavaScript.path} is ${formatBytes(largestJavaScript.size)} (limit ${formatBytes(budgets.largestJavaScriptBytes)})`)
  }
  if (echartsAssets.some((asset) => asset.size > budgets.echartsBytes)) {
    const largestEcharts = echartsAssets.reduce((largest, asset) => (asset.size > largest.size ? asset : largest))
    fail(`ECharts chunk ${largestEcharts.path} is ${formatBytes(largestEcharts.size)} (limit ${formatBytes(budgets.echartsBytes)})`)
  }
  if (javascript.some((asset) => /(?:^|\/)heic-to-/.test(asset.path))) {
    fail('heic-to must not be emitted because image compression does not support HEIC input')
  }
}
