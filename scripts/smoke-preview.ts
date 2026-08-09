// 生产冒烟：build → preview → 对生产产物跑 dev-browser 冒烟（比 dev 模式快且更接近线上）。
// dev 模式冒烟受 vite 按需编译影响（模块逐个编译、易资源耗尽），preview 是纯静态文件服务。
//
// 用法：
//   nub run smoke:preview                  # 完整流程（build 约 1-2 分钟 + 冒烟）
//   nub run smoke:preview -- --port 4321   # 指定 preview 端口（默认 4321）

import { spawn } from 'node:child_process'
import { argv, exit as exitProcess } from 'node:process'

const port = '4321'
const argPort = argv.indexOf('--port')
const previewPort = argPort !== -1 ? argv[argPort + 1] : port
const baseUrl = `http://localhost:${previewPort}`

function run(cmd: string, args: string[], inherit = true): Promise<number> {
  return new Promise((resolveExit) => {
    const child = spawn(cmd, args, { shell: true, stdio: inherit ? 'inherit' : 'ignore' })
    child.on('close', code => resolveExit(code ?? 1))
  })
}

async function waitForPort(url: string, timeoutMs = 60000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok)
        return
    }
    catch {
      // 端口未就绪，重试
    }
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error(`preview 端口 ${url} 在 ${timeoutMs}ms 内未就绪`)
}

console.log(`1/3 构建生产产物…`)
const buildCode = await run('nub', ['run', 'build'])
if (buildCode !== 0) {
  console.error('✗ 构建失败，中止冒烟')
  exitProcess(1)
}

console.log(`2/3 启动 preview（${baseUrl}）…`)
const preview = spawn('nubx', ['astro', 'preview', '--port', previewPort], { shell: true, stdio: 'ignore' })
await waitForPort(baseUrl)

let smokeCode = 1
try {
  console.log(`3/3 生产冒烟…`)
  smokeCode = await run('nub', ['run', 'smoke', '--', '--url', baseUrl])
}
finally {
  spawn('taskkill', ['/pid', String(preview.pid), '/t', '/f'])
  console.log('preview 已关闭')
}

exitProcess(smokeCode)
