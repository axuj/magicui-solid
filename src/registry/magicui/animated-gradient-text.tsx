import type { JSX } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export interface AnimatedGradientTextProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  speed?: number
  colorFrom?: string
  colorTo?: string
}

export function AnimatedGradientText(props: AnimatedGradientTextProps) {
  const merged = mergeProps(
    { speed: 1, colorFrom: '#ffaa40', colorTo: '#9c40ff' },
    props,
  )
  const [local, rest] = splitProps(merged, ['children', 'speed', 'colorFrom', 'colorTo', 'class'])

  return (
    <span
      style={{
        '--bg-size': `${local.speed * 300}%`,
        '--color-from': local.colorFrom,
        '--color-to': local.colorTo,
      }}
      class={cn(
        `
          inline animate-gradient bg-linear-to-r from-(--color-from)
          via-(--color-to) to-(--color-from) bg-size-[var(--bg-size)_100%]
          bg-clip-text text-transparent
        `,
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </span>
  )
}
