import type { DitherColor, DitherPattern } from '@/registry/magicui/dither-field'
import { For } from 'solid-js'

import { DitherField } from '@/registry/magicui/dither-field'

interface Tile {
  label: string
  pattern: DitherPattern
  color: DitherColor
  intensity?: number
  class: string
}

const tiles: Tile[] = [
  {
    label: 'Ink on paper',
    pattern: 'horizon',
    color: '#0a0a0a',
    class: 'bg-white text-neutral-950',
  },
  {
    label: 'Chalk on slate',
    pattern: 'horizon',
    color: '#fafafa',
    class: 'bg-neutral-950 text-white',
  },
  {
    label: 'Sodium',
    pattern: 'glow',
    color: ['#78350f', '#f59e0b', '#fef3c7'],
    class: 'bg-[#140b02] text-amber-50',
  },
  {
    label: 'Glacier',
    pattern: 'aurora',
    color: ['#164e63', '#06b6d4', '#cffafe'],
    intensity: 1.1,
    class: 'bg-[#020f14] text-cyan-50',
  },
]

export function DitherFieldColorsDemo() {
  return (
    <div class="
      grid w-full grid-cols-2 gap-3
      md:grid-cols-4 md:gap-4
    "
    >
      <For each={tiles}>
        {tile => (
          <DitherField
            pattern={tile.pattern}
            color={tile.color}
            intensity={tile.intensity}
            class={`
              flex h-48 items-start rounded-xl border p-4 select-none
              md:h-64
              ${tile.class}
            `}
          >
            <p class="text-sm font-medium">{tile.label}</p>
          </DitherField>
        )}
      </For>
    </div>
  )
}
