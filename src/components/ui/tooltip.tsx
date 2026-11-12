import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type { ValidComponent } from '@solidjs/web'
import type { Component } from 'solid-js'

import * as TooltipPrimitive from '@kobalte/core/tooltip'
import { omit } from 'solid-js'

import { cn } from '~/lib/utils'

const TooltipTrigger = TooltipPrimitive.Trigger

const Tooltip: Component<TooltipPrimitive.TooltipRootProps> = (props) => {
  return <TooltipPrimitive.Root gutter={4} {...props} />
}

type TooltipContentProps<T extends ValidComponent = 'div'>
  = TooltipPrimitive.TooltipContentProps<T> & { class?: string | undefined }

function TooltipContent<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, TooltipContentProps<T>>) {
  // Kobalte's polymorphic props narrow the pass-through set to TooltipContentProps.
  const rest = omit(props as TooltipContentProps, 'class')
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        class={cn(
          `
            z-50 origin-(--kb-popover-content-transform-origin) overflow-hidden
            rounded-md border bg-popover px-3 py-1.5 text-sm
            text-popover-foreground shadow-md
          `,
          props.class,
        )}
        {...rest}
      />
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipTrigger }
