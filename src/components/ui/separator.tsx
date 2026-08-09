import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

interface SeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

function Separator(props: SeparatorProps) {
  const [local, rest] = splitProps(props, ['class', 'orientation', 'decorative'])
  return (
    <div
      role={local.decorative === false ? 'separator' : undefined}
      aria-orientation={local.decorative === false ? local.orientation ?? 'horizontal' : undefined}
      class={cn(
        'shrink-0 bg-border',
        (local.orientation ?? 'horizontal') === 'horizontal'
          ? 'h-px w-full'
          : `h-full w-px`,
        local.class,
      )}
      {...rest}
    />
  )
}

export { Separator }
