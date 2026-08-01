import { mkdirSync, writeFileSync } from 'node:fs'
import { registry } from '../registry.ts'

mkdirSync('__generated__', { recursive: true })
writeFileSync('__generated__/registry.json', `${JSON.stringify(registry, null, 1)}\n`)
console.log('✓ __generated__/registry.json generated from registry.ts')
