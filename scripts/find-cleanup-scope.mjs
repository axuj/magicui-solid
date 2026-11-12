#!/usr/bin/env node
/**
 * Solid 2 forbids calling onCleanup inside a createTrackedEffect / onSettled
 * callback; teardown must be returned instead. The build does not catch it —
 * it throws CLEANUP_IN_FORBIDDEN_SCOPE at runtime and halts the whole reactive
 * system (REACTIVITY_HALTED), which looks like "this page stopped updating"
 * and is hard to trace back from the symptom.
 *
 * This script lists every violation in one pass.
 *
 * Usage: node scripts/find-cleanup-scope.mjs [dir...] [--json]
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const FORBIDDEN_SCOPES = new Set(['onSettled', 'createTrackedEffect'])
const TARGET = 'onCleanup'
const roots = process.argv.slice(2).filter(a => !a.startsWith('--'))
const defaultRoots = ['src']

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.'))
        continue
      walk(full, out)
    }
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      out.push(full)
    }
  }
  return out
}

function calleeName(call) {
  const { expression } = call
  if (ts.isIdentifier(expression))
    return expression.text
  if (ts.isPropertyAccessExpression(expression))
    return expression.name.text
  return null
}

const hits = []

for (const root of (roots.length ? roots : defaultRoots)) {
  for (const file of walk(root)) {
    const text = fs.readFileSync(file, 'utf8')
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const lineOf = node => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1

    // Stack of scopes: the starting line of the innermost forbidden callback.
    const visit = (node, scope) => {
      if (ts.isCallExpression(node)) {
        const name = calleeName(node)
        if (name === TARGET && scope)
          hits.push({ file, line: lineOf(node), scopeLine: scope, text: text.split('\n')[lineOf(node) - 1].trim() })
        if (FORBIDDEN_SCOPES.has(name) && node.arguments.length) {
          // The callback body opens a new effect scope; every onCleanup inside it is invalid.
          for (const arg of node.arguments) {
            if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))
              visit(arg, lineOf(node))
            else
              visit(arg, scope)
          }
          return
        }
        // createEffect(compute, effect): the effect callback has no owner, so
        // teardown must be returned. Only the second argument is the effect
        // callback — do not scan compute as one.
        if (name === 'createEffect' && node.arguments.length >= 2) {
          visit(node.arguments[0], scope)
          visit(node.arguments[1], lineOf(node))
          return
        }
      }
      ts.forEachChild(node, child => visit(child, scope))
    }
    visit(source, null)
  }
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(hits))
  process.exit(hits.length ? 1 : 0)
}

if (!hits.length) {
  console.log('No forbidden onCleanup calls found')
  process.exit(0)
}

for (const hit of hits)
  console.log(`${hit.file}:${hit.line}  (inside the effect scope starting at line ${hit.scopeLine})  ${hit.text}`)
console.log(`\n${hits.length} occurrence(s)`)
process.exit(1)
