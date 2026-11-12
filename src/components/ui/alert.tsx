import type { PolymorphicProps } from '@kobalte/core/polymorphic'

import type { ComponentProps, ValidComponent } from '@solidjs/web'
import type { VariantProps } from 'class-variance-authority'
import type { Component } from 'solid-js'

import * as AlertPrimitive from '@kobalte/core/alert'

import { cva } from 'class-variance-authority'
import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  `
    relative w-full rounded-lg border p-4
    [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground
    [&>svg+div]:-translate-y-0.75
    [&>svg~*]:pl-7
  `,
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          `
            border-destructive/50 text-destructive
            dark:border-destructive
            [&>svg]:text-destructive
          `,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type AlertRootProps<T extends ValidComponent = 'div'> = AlertPrimitive.AlertRootProps<T>
  & VariantProps<typeof alertVariants> & { class?: string | undefined }

function Alert<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, AlertRootProps<T>>) {
  const others = omit(props, 'class', 'variant') as AlertRootProps<T>
  return (
    <AlertPrimitive.Root
      class={cn(alertVariants({ variant: props.variant }), props.class)}
      {...others}
    />
  )
}

const AlertTitle: Component<ComponentProps<'h5'>> = (props) => {
  const others = omit(props, 'class')
  return <h5 class={cn('mb-1 leading-none font-medium tracking-tight', props.class)} {...others} />
}

const AlertDescription: Component<ComponentProps<'div'>> = (props) => {
  const others = omit(props, 'class')
  return (
    <div
      class={cn(`
        text-sm
        [&_p]:leading-relaxed
      `, props.class)}
      {...others}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
