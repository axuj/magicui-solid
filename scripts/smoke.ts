// 运行时冒烟：用 dev-browser 逐个打开组件文档页，收集 console error / pageerror。
// 前提：dev server 已运行（如 `nub run dev --port 4322`）。
//
// 用法：
//   nub run smoke                         # 默认 http://localhost:4321
//   nub run smoke -- --url http://localhost:4322
//   nub run smoke -- --only globe         # 只跑路由包含 "globe" 的页面（调试用）
//   nub run smoke -- --no-prewarm         # 跳过 HTTP 预热（vite 冷编译时可能触发资源耗尽）

import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { argv, cwd, env, exit as exitProcess } from 'node:process'

const args = argv.slice(2)
const urlFlag = args.indexOf('--url')
const baseUrl = urlFlag !== -1 ? args[urlFlag + 1] : env.SMOKE_URL ?? 'http://localhost:4321'
const onlyFlag = args.indexOf('--only')
const only = onlyFlag !== -1 ? args[onlyFlag + 1] : undefined
const noPrewarm = args.includes('--no-prewarm')

const docsDir = resolve(cwd(), 'src/content/docs/docs/components')
let routes = readdirSync(docsDir)
  .filter(f => f.endsWith('.mdx'))
  .map(f => `/docs/components/${f.replace(/\.mdx$/, '')}`)
  .filter(r => !r.endsWith('/index'))
if (only)
  routes = routes.filter(r => r.includes(only))

console.log(`冒烟目标: ${baseUrl}（${routes.length} 个组件文档页）`)

// HTTP 预热：先请求全部页面 HTML，让 vite 按需编译提前完成并缓存，
// 浏览器侧请求量大幅下降，避免连续导航时 Chrome 资源耗尽（ERR_INSUFFICIENT_RESOURCES）
if (!noPrewarm) {
  console.log('预热页面（vite 模块编译缓存）…')
  const batchSize = 10
  let ok = 0
  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize)
    const results = await Promise.allSettled(batch.map(r => fetch(baseUrl + r)))
    ok += results.filter(r => r.status === 'fulfilled').length
  }
  console.log(`预热完成（${ok}/${routes.length}）`)
}

// dev-browser 沙箱脚本（QuickJS，非 Node，嵌入路由列表），复用单个 tab 循环导航
const browserScript = `
const BASE = ${JSON.stringify(baseUrl)};
const routes = ${JSON.stringify(routes)};
const results = [];
const page = await browser.getPage('smoke');
const isError = (m) => m.type() === 'error';
// ERR_CACHE_OPERATION_NOT_SUPPORTED：Chrome 对跨域媒体（如 pexels 视频）缓存操作的环境噪音，
// 不影响资源加载与播放，过滤掉以免假阳性；其余外域错误（如图标 404）保留
const isIgnorable = (text) => text.includes('ERR_CACHE_OPERATION_NOT_SUPPORTED');
for (const route of routes) {
  const errors = [];
  const onError = (msg) => {
    const text = typeof msg === 'string' ? msg : msg.text();
    if (!isIgnorable(text)) errors.push(text);
  };
  page.on('pageerror', onError);
  page.on('console', (m) => { if (isError(m)) errors.push(m.text() + ' @' + (m.location ? m.location().url : '')); });
  try {
    await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1500);
  } catch (e) {
    errors.push('GOTO_FAIL: ' + String(e));
    await page.waitForTimeout(3000);
  }
  page.off('pageerror', onError);
  page.off('console', onError);
  results.push({ route, errors });
}
console.log('SMOKE_RESULT=' + JSON.stringify(results));
`

const child = spawn('dev-browser', ['--browser', 'smoke', '--idle-timeout', '5m', '--timeout', '1800'], {
  shell: true,
})

let output = ''
let stderr = ''
child.stdout.on('data', chunk => (output += chunk))
child.stderr.on('data', chunk => (stderr += chunk))

const exit = new Promise<number>((resolveExit) => {
  child.on('close', code => resolveExit(code ?? 1))
})

child.stdin.write(browserScript)
child.stdin.end()

const code = await exit

if (code !== 0) {
  console.error(`✗ dev-browser 异常退出（${code}）`)
  if (stderr)
    console.error(stderr)
  exitProcess(1)
}

const match = output.match(/SMOKE_RESULT=(\[[\s\S]*\])/)
if (!match) {
  console.error('✗ 未解析到冒烟结果，输出:')
  console.error(output || stderr || '(空)')
  exitProcess(1)
}

const results: { route: string, errors: string[] }[] = JSON.parse(match[1])
const failed = results.filter(r => r.errors.length > 0)

if (failed.length === 0) {
  console.log(`✓ 冒烟通过：${results.length} 个页面无 console error`)
}
else {
  console.error(`✗ ${failed.length}/${results.length} 个页面存在错误:`)
  for (const f of failed) {
    console.error(`  ${f.route}`)
    for (const e of f.errors)
      console.error(`    - ${e}`)
  }
  exitProcess(1)
}
