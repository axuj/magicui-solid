import type { JSX } from '@solidjs/web'

import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface AnimatedGradientTextProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  speed?: number
  colorFrom?: string
  colorTo?: string
}

export function AnimatedGradientText(props: AnimatedGradientTextProps) {
  const rest = omit(props, 'children', 'speed', 'colorFrom', 'colorTo', 'class')
  const colorFrom = () => props.colorFrom ?? '#ffaa40'
  const colorTo = () => props.colorTo ?? '#9c40ff'
  const speed = () => props.speed ?? 1

  return (
    <span
      style={{
        '--bg-size': `${speed() * 300}%`,
        '--color-from': colorFrom(),
        '--color-to': colorTo(),
      }}
      class={cn(
        `
          inline animate-gradient bg-linear-to-r from-(--color-from)
          via-(--color-to) to-(--color-from) bg-size-[var(--bg-size)_100%]
          bg-clip-text text-transparent
        `,
        props.class,
      )}
      {...rest}
    >
      {props.children}
    </span>
  )
}
