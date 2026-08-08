import type { ComponentProps } from 'solid-js'
import { ArrowRight } from 'lucide-solid'
import { splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

export interface InteractiveHoverButtonProps extends ComponentProps<'button'> {}

export function InteractiveHoverButton(props: InteractiveHoverButtonProps) {
  const [local, rest] = splitProps(props, ['class', 'children'])

  return (
    <button
      class={cn(
        `
          group relative w-auto cursor-pointer overflow-hidden rounded-full
          border bg-background p-2 px-6 text-center font-semibold
        `,
        local.class,
      )}
      {...rest}
    >
      <div class="flex items-center justify-center gap-2">
        <div class="
          size-2 rounded-full bg-primary transition-all duration-300
          group-hover:scale-[100.8]
        "
        />
        <span class="
          inline-block transition-all duration-300
          group-hover:translate-x-12 group-hover:opacity-0
        "
        >
          {local.children}
        </span>
      </div>
      <div class="
        absolute top-0 z-10 flex size-full translate-x-12 items-center
        justify-center gap-2 text-primary-foreground opacity-0 transition-all
        duration-300
        group-hover:-translate-x-5 group-hover:opacity-100
      "
      >
        <span>{local.children}</span>
        <ArrowRight />
      </div>
    </button>
  )
}
