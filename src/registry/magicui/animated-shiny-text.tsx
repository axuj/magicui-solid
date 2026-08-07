import type { JSX } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export interface AnimatedShinyTextProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  shimmerWidth?: number
}

export function AnimatedShinyText(props: AnimatedShinyTextProps) {
  const merged = mergeProps({ shimmerWidth: 100 }, props)
  const [local, rest] = splitProps(merged, ['children', 'shimmerWidth', 'class'])

  return (
    <span
      style={{ '--shiny-width': `${local.shimmerWidth}px` }}
      class={cn(
        `
          mx-auto max-w-md text-neutral-600/70
          dark:text-neutral-400/70
        `,

        // Shine effect
        `
          animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text
          bg-position-[0_0] bg-no-repeat
          [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]
        `,

        // Shine gradient
        `
          bg-linear-to-r from-transparent via-black/80 via-50% to-transparent
          dark:via-white/80
        `,

        local.class,
      )}
      {...rest}
    >
      {local.children}
    </span>
  )
}
