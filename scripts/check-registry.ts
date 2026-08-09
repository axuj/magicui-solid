// registry.ts 业务对账脚本（shadcn build 只查格式与必填，不查业务）：
// 1. 每个 item 的源文件必须存在（error）
// 2. 每个 registry:ui 组件必须有文档覆盖：同名 mdx，或某组件 mdx 的安装命令提及 @magicui-solid/<name>（error）
// 3. src/registry/magicui/ 下未注册的 .tsx 文件（warn，可能为暂未发布的组件）
// 4. registryDependencies 引用必须存在于本 registry（error）；URL / json 路径 视为外部引用放行
// 5. 组件源码用到的 animate-* 类必须在 item 的动画声明中（error，防"装上了但动画不动"）
// 6. animation 声明引用的 keyframes 必须已定义（error）
//
// 挂载：`nub run registry` 末尾自动执行；也可单独 `nub run check:registry`。

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { cwd, exit } from 'node:process'
import { registry } from '../registry.ts'

const root = cwd()
const uiDir = resolve(root, 'src/registry/magicui')
const docsDir = resolve(root, 'src/content/docs/docs/components')

const errors: string[] = []
const warns: string[] = []

// Tailwind 内置动画工具类，无需 registry 声明
const BUILTIN_ANIMS = new Set(['none', 'spin', 'ping', 'pulse', 'bounce'])

const items = registry.items
const itemNames = new Set(items.map(i => i.name))
const uiItems = items.filter(i => i.type === 'registry:ui')

const docNames = existsSync(docsDir)
  ? new Set(readdirSync(docsDir).filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, '')))
  : new Set<string>()
const docContents = existsSync(docsDir)
  ? new Map([...docNames].map(n => [n, readFileSync(join(docsDir, `${n}.mdx`), 'utf8')]))
  : new Map<string, string>()

// 1. 源文件存在性
for (const item of items) {
  for (const file of item.files ?? []) {
    if (!existsSync(resolve(root, file.path)))
      errors.push(`${item.name}: 文件缺失 ${file.path}`)
  }
}

// 2. ui 组件文档覆盖
for (const item of uiItems) {
  const hasDoc = docNames.has(item.name) || [...docContents.values()].some(c => c.includes(`@magicui-solid/${item.name}`))
  if (!hasDoc)
    errors.push(`${item.name}: 无文档覆盖（无同名 mdx 且无安装命令提及）`)
}

// 3. 未注册源文件（warn）
if (existsSync(uiDir)) {
  for (const file of readdirSync(uiDir).filter(f => f.endsWith('.tsx'))) {
    const name = file.replace(/\.tsx$/, '')
    if (!itemNames.has(name))
      warns.push(`${file}: src/registry/magicui 中未注册（若为暂未发布组件可忽略）`)
  }
}

// 4. registryDependencies 引用
for (const item of items) {
  for (const dep of item.registryDependencies ?? []) {
    if (dep.startsWith('@/') || dep.startsWith('@components') || /^https?:/.test(dep))
      continue
    const name = dep.replace('@magicui-solid/', '')
    if (name === dep)
      errors.push(`${item.name}: 无法识别的依赖 "${dep}"（应为 @magicui-solid/x、URL 或 @/ 别名）`)
    else if (!itemNames.has(name))
      errors.push(`${item.name}: 依赖悬空 @magicui-solid/${name}（registry 中无此组件）`)
  }
}

// 5. animate-* 类与 keyframes 对照
for (const item of uiItems) {
  const sourcePath = item.files?.[0]?.path
  const filePath = sourcePath && resolve(root, sourcePath)
  if (!filePath || !existsSync(filePath))
    continue
  const source = readFileSync(filePath, 'utf8')
  const usedAnimations = new Set([...source.matchAll(/animate-([A-Za-z0-9-]+)/g)].map(m => m[1]))

  const extend = (item as any).tailwind?.config?.theme?.extend ?? {}
  const declared = new Set(Object.keys(extend.animation ?? {}))
  const keyframes = new Set(Object.keys(extend.keyframes ?? {}))

  for (const name of usedAnimations) {
    if (BUILTIN_ANIMS.has(name))
      continue
    if (!declared.has(name))
      errors.push(`${item.name}: 源码使用 animate-${name} 但本组件动画声明缺失`)
  }

  for (const [animName, rule] of Object.entries(extend.animation ?? {})) {
    if (BUILTIN_ANIMS.has(animName))
      continue
    const keyframe = String(rule).split(/\s+/)[0]
    if (!keyframe || keyframe === animName || keyframe.startsWith('var(') || /^\d/.test(keyframe))
      continue
    if (!keyframes.has(keyframe))
      errors.push(`${item.name}: animation "${animName}" 引用未定义 keyframes "${keyframe}"`)
  }
}

if (warns.length > 0) {
  console.warn(`⚠ ${warns.length} 个警告:`)
  for (const w of warns)
    console.warn(`  - ${w}`)
}

if (errors.length > 0) {
  console.error(`✗ ${errors.length} 个错误:`)
  for (const e of errors)
    console.error(`  - ${e}`)
  exit(1)
}

console.log(`✓ registry 检查通过（${items.length} 个 item，${uiItems.length} 个组件）`)
