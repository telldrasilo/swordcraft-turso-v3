/**
 * Запуск `next dev` на первом свободном порту из PORT (по умолчанию 3000), затем 3001…3005.
 * Решает ситуацию, когда `listen EADDRINUSE :::3000` и «проект не грузится» из-за нестартовавшего dev-сервера.
 */
const { spawn } = require('child_process')
const fs = require('fs')
const net = require('net')
const path = require('path')

function canListen(port) {
  return new Promise((resolve) => {
    const srv = net.createServer()
    srv.once('error', () => resolve(false))
    srv.once('listening', () => srv.close(() => resolve(true)))
    // Как у Next: все интерфейсы (иначе 127.0.0.1 «свободен», а :::3000 занят — ложное OK)
    srv.listen(port)
  })
}

async function pickPort() {
  const fromEnv = process.env.PORT ? parseInt(process.env.PORT, 10) : NaN
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    if (await canListen(fromEnv)) return { port: fromEnv, fallback: false }
    console.error(
      `[dev] PORT=${fromEnv} занят. Освободите порт или уберите переменную PORT (тогда будет выбран 3000–3005).`
    )
    process.exit(1)
  }
  for (let p = 3000; p <= 3005; p++) {
    if (await canListen(p)) return { port: p, fallback: p !== 3000 }
  }
  return null
}

async function main() {
  const picked = await pickPort()
  if (picked == null) {
    console.error(
      '[dev] Порты 3000–3005 заняты. Закройте лишние процессы или задайте свободный PORT=...'
    )
    process.exit(1)
  }
  const { port, fallback } = picked
  const origin = `http://localhost:${port}`

  if (fallback) {
    console.warn(
      `\n[dev] ═══════════════════════════════════════════════════════\n` +
        `[dev] Порт 3000 занят — dev-сервер: ${origin}\n` +
        `[dev] Откройте именно этот URL. Старая вкладка на :3000 даёт 404 на /_next/static.\n` +
        `[dev] ═══════════════════════════════════════════════════════\n`
    )
  } else {
    console.log(`[dev] ${origin} (полный URL снижает путаницу с портами и чанками)`)
  }

 const root = path.join(__dirname, '..')
  try {
    fs.writeFileSync(
      path.join(root, '.next-dev-port'),
      `${port}\n`,
      'utf8'
    )
  } catch {
    /* ignore */
  }

  const nextCli = require.resolve('next/dist/bin/next')
  /**
   * NEXTAUTH_URL должен совпадать с фактическим origin, иначе внешние инструменты/вкладки
   * на «не тот» порт тянут HTML с одного хоста и чанки с другого → 404.
   * Явный NEXTAUTH_URL в .env не перезаписываем.
   */
  const nextAuthUrl = process.env.NEXTAUTH_URL || origin
  const child = spawn(process.execPath, [nextCli, 'dev', '-p', String(port)], {
    stdio: 'inherit',
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      NEXTAUTH_URL: nextAuthUrl,
    },
  })
  child.on('exit', (code) => process.exit(code ?? 0))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
