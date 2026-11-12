/**
 * Rewriting onCleanup(() => {...}) as return () => {...} during the migration
 * swallows every statement after it: onCleanup was a plain call, but return
 * ends the function. This dead code produces no type error and no runtime
 * diagnostic; it shows up as "works the first time, nothing happens the second
 * time". Walk the tree with the TypeScript AST to find it.
 *
 * Usage: node scripts/find-dead-after-cleanup.mjs [path ...]
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['src']

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__generated__')
        continue
      yield* walk(full)
    }
    else if (/\.tsx?$/.test(entry.name)) {
      yield full
    }
  }
}

const hits = []
for (const root of roots) {
  const files = fs.statSync(root).isDirectory() ? [...walk(root)] : [root]
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf-8')
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

    const visit = (node) => {
      if (ts.isBlock(node)) {
        const stmts = node.statements
        for (let i = 0; i < stmts.length - 1; i++) {
          const st = stmts[i]
          if (!ts.isReturnStatement(st) || !st.expression)
            continue
          const expr = st.expression
          // Cleanup shape: a zero-argument arrow or function expression with a block body.
          const isCleanup = (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr))
            && expr.parameters.length === 0
            && ts.isBlock(expr.body)
          if (!isCleanup)
            continue
          const line = source.getLineAndCharacterOfPosition(st.getStart(source)).line + 1
          const tail = stmts[i + 1]
          const tailLine = source.getLineAndCharacterOfPosition(tail.getStart(source)).line + 1
          hits.push({
            file,
            line,
            tailLine,
            tail: tail.getText(source).split('\n')[0].slice(0, 90),
          })
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
}

if (!hits.length) {
  console.log('No statements found after a returned cleanup')
  process.exit(0)
}
for (const h of hits)
  console.log(`${h.file}:${h.line}  line ${h.tailLine} is unreachable: ${h.tail}`)

console.log(`\n${hits.length} occurrence(s)`)
process.exit(1)
