import type { JSX } from 'solid-js'
import { For, mergeProps, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export interface RippleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
}

export function Ripple(props: RippleProps) {
  const merged = mergeProps({ mainCircleSize: 210, mainCircleOpacity: 0.24, numCircles: 8 }, props)
  const [local, rest] = splitProps(merged, ['mainCircleSize', 'mainCircleOpacity', 'numCircles', 'class'])

  return (
    <div
      class={cn(
        `
          pointer-events-none absolute inset-0
          mask-[linear-gradient(to_bottom,white,transparent)] select-none
        `,
        local.class,
      )}
      {...rest}
    >
      <For each={Array.from({ length: local.numCircles })}>
        {(_, i) => (
          <div
            class="
              absolute animate-ripple rounded-full border bg-foreground/25
              shadow-xl
            "
            style={{
              '--i': i(),
              'width': `${local.mainCircleSize + i() * 70}px`,
              'height': `${local.mainCircleSize + i() * 70}px`,
              'opacity': `${local.mainCircleOpacity - i() * 0.03}`,
              'animation-delay': `${i() * 0.06}s`,
              'border-style': 'solid',
              'border-width': '1px',
              'border-color': 'var(--foreground)',
              'top': '50%',
              'left': '50%',
              'transform': 'translate(-50%, -50%) scale(1)',
            }}
          />
        )}
      </For>
    </div>
  )
}
