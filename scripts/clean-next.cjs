/**
 * Удаляет каталог `.next` (кеш сборки Next.js).
 * Помогает при 404 на /_next/static/chunks/*.js и layout.css после сбоев dev/HMR.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const nextDir = path.join(root, '.next')

try {
  fs.rmSync(nextDir, { recursive: true, force: true })
  console.log('[clean-next] Удалён каталог .next')
} catch (e) {
  if (e && e.code === 'ENOENT') {
    console.log('[clean-next] .next уже отсутствует')
  } else {
    console.error('[clean-next]', e)
    process.exit(1)
  }
}
