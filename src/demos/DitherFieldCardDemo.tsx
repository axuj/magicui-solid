import { For } from 'solid-js'

import { DitherField } from '@/registry/magicui/dither-field'

const cards = [
  {
    pattern: 'glow',
    title: 'Live previews',
    body: 'Every branch gets a URL the moment you push.',
    class: 'md:col-span-2',
  },
  {
    pattern: 'clouds',
    title: 'Edge cache',
    body: 'Static assets served from 300 cities.',
    class: '',
  },
  {
    pattern: 'waves',
    title: 'Instant rollbacks',
    body: 'Go back to any deploy in one click.',
    class: 'md:col-span-3',
  },
] as const

export function DitherFieldCardDemo() {
  return (
    <div class="
      grid w-full max-w-3xl gap-4
      md:grid-cols-3
    "
    >
      <For each={cards}>
        {card => (
          <DitherField
            pattern={card.pattern}
            color="var(--muted-foreground)"
            intensity={0.6}
            class={`
              flex h-44 flex-col justify-end rounded-xl border bg-card p-5
              select-none
              md:h-56 md:p-6
              ${card.class}
            `}
          >
            <div class="
              absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-card
              to-transparent
            "
            />
            <h3 class="relative text-lg font-semibold tracking-tight">
              {card.title}
            </h3>
            <p class="relative text-sm text-muted-foreground">{card.body}</p>
          </DitherField>
        )}
      </For>
    </div>
  )
}
