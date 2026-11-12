import type { JSX } from '@solidjs/web'

import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

interface SeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

function Separator(props: SeparatorProps) {
  const rest = omit(props, 'class', 'orientation', 'decorative')
  return (
    <div
      role={props.decorative === false ? 'separator' : undefined}
      aria-orientation={props.decorative === false ? props.orientation ?? 'horizontal' : undefined}
      class={cn(
        'shrink-0 bg-border',
        (props.orientation ?? 'horizontal') === 'horizontal'
          ? 'h-px w-full'
          : `h-full w-px`,
        props.class,
      )}
      {...rest}
    />
  )
}

export { Separator }
