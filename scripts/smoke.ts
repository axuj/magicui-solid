// Runtime smoke test: open every component doc page in a real Chromium and
// collect console errors / uncaught exceptions. Static checks and SSR output
// cannot see hydration-time failures, which is what this covers.
//
// Requires a system Chrome or Edge. playwright-core does not download browsers;
// override with SMOKE_CHROME_PATH=/path/to/binary or SMOKE_BROWSER_CHANNEL=msedge.
//
// Usage:
//   nub run smoke                          # default http://localhost:4321
//   nub run smoke -- --url http://localhost:4322
//   nub run smoke -- --only globe          # only routes containing "globe"
//   nub run smoke -- --no-prewarm          # skip the HTTP warmup

import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { argv, cwd, env, exit as exitProcess } from 'node:process'
import { chromium } from 'playwright-core'

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

console.log(`Smoke target: ${baseUrl} (${routes.length} component doc pages)`)

// Warm the dev server's on-demand module compilation cache over HTTP. Without
// this, a burst of navigations can exhaust Chrome's resources mid-run.
if (!noPrewarm) {
  console.log('Warming pages (vite module compilation cache)…')
  const batchSize = 10
  let ok = 0
  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize)
    const results = await Promise.allSettled(batch.map(r => fetch(baseUrl + r)))
    ok += results.filter(r => r.status === 'fulfilled').length
  }
  console.log(`Warmup done (${ok}/${routes.length})`)
}

// Chrome reports this for cross-origin media (e.g. pexels videos). It does not
// affect loading or playback, so filtering it avoids a stable false positive.
const isIgnorable = (text: string) => text.includes('ERR_CACHE_OPERATION_NOT_SUPPORTED')

const browser = await chromium.launch({
  headless: true,
  ...(env.SMOKE_CHROME_PATH
    ? { executablePath: env.SMOKE_CHROME_PATH }
    : { channel: env.SMOKE_BROWSER_CHANNEL ?? 'chrome' }),
}).catch((e) => {
  console.error('✗ Could not launch a browser. Install Chrome/Edge, or set SMOKE_CHROME_PATH / SMOKE_BROWSER_CHANNEL.')
  console.error(String(e))
  exitProcess(1)
})

const page = await browser.newPage()
let current: string[] = []
page.on('pageerror', (e) => {
  const text = String(e.message)
  if (!isIgnorable(text))
    current.push(text)
})
page.on('console', (m) => {
  if (m.type() === 'error')
    current.push(`${m.text()} @${m.location().url}`)
})

const results: { route: string, errors: string[] }[] = []
try {
  for (const route of routes) {
    current = []
    try {
      await page.goto(baseUrl + route, { waitUntil: 'load', timeout: 60000 })
      await page.waitForTimeout(1500)
    }
    catch (e) {
      current.push(`GOTO_FAIL: ${String(e)}`)
      await page.waitForTimeout(3000)
    }
    results.push({ route, errors: [...current] })
  }
}
finally {
  await browser.close()
}

const failed = results.filter(r => r.errors.length > 0)
if (failed.length === 0) {
  console.log(`✓ Smoke passed: ${results.length} pages with no console error`)
}
else {
  console.error(`✗ ${failed.length}/${results.length} pages have errors:`)
  for (const f of failed) {
    console.error(`  ${f.route}`)
    for (const e of f.errors)
      console.error(`    - ${e}`)
  }
  exitProcess(1)
}
