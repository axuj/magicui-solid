import type { JSX } from '@solidjs/web'
import { For, omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface RippleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
}

export function Ripple(props: RippleProps) {
  const rest = omit(props, 'mainCircleSize', 'mainCircleOpacity', 'numCircles', 'class')
  const mainCircleOpacity = () => props.mainCircleOpacity ?? 0.24
  const mainCircleSize = () => props.mainCircleSize ?? 210
  const numCircles = () => props.numCircles ?? 8

  return (
    <div
      class={cn(
        `
          pointer-events-none absolute inset-0
          mask-[linear-gradient(to_bottom,white,transparent)] select-none
        `,
        props.class,
      )}
      {...rest}
    >
      <For each={Array.from({ length: numCircles() })}>
        {(_, i) => (
          <div
            class="
              absolute animate-ripple rounded-full border bg-foreground/25
              shadow-xl
            "
            style={{
              '--i': i(),
              'width': `${mainCircleSize() + i() * 70}px`,
              'height': `${mainCircleSize() + i() * 70}px`,
              'opacity': `${mainCircleOpacity() - i() * 0.03}`,
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
