import type { JSX } from '@solidjs/web'

import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface AnimatedShinyTextProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  shimmerWidth?: number
}

export function AnimatedShinyText(props: AnimatedShinyTextProps) {
  const rest = omit(props, 'children', 'shimmerWidth', 'class')
  const shimmerWidth = () => props.shimmerWidth ?? 100

  return (
    <span
      style={{ '--shiny-width': `${shimmerWidth()}px` }}
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

        props.class,
      )}
      {...rest}
    >
      {props.children}
    </span>
  )
}
