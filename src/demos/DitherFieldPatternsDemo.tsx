import { For } from 'solid-js'

import { DitherField } from '@/registry/magicui/dither-field'

const patterns = ['horizon', 'glow', 'aurora', 'waves', 'clouds'] as const

export function DitherFieldPatternsDemo() {
  return (
    <div class="
      grid w-full grid-cols-2 gap-3
      md:grid-cols-5
    "
    >
      <For each={patterns}>
        {pattern => (
          <DitherField
            pattern={pattern}
            class="
              flex h-32 items-end rounded-lg border bg-background p-3
              select-none
              last:col-span-2
              md:h-40
              md:last:col-span-1
            "
          >
            <code class="
              rounded-sm bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur-sm
            "
            >
              {pattern}
            </code>
          </DitherField>
        )}
      </For>
    </div>
  )
}
