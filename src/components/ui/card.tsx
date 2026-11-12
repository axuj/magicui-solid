import type { ComponentProps } from '@solidjs/web'

import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

function Card(props: ComponentProps<'div'>) {
  const rest = omit(props, 'class')
  return (
    <div
      class={cn('rounded-xl border bg-card text-card-foreground shadow-sm', props.class)}
      {...rest}
    />
  )
}

function CardHeader(props: ComponentProps<'div'>) {
  const rest = omit(props, 'class')
  return <div class={cn('flex flex-col space-y-1.5 p-6', props.class)} {...rest} />
}

function CardTitle(props: ComponentProps<'div'>) {
  const rest = omit(props, 'class')
  return <div class={cn('leading-none font-semibold tracking-tight', props.class)} {...rest} />
}

function CardDescription(props: ComponentProps<'div'>) {
  const rest = omit(props, 'class')
  return <div class={cn('text-sm text-muted-foreground', props.class)} {...rest} />
}

function CardContent(props: ComponentProps<'div'>) {
  const rest = omit(props, 'class')
  return <div class={cn('p-6 pt-0', props.class)} {...rest} />
}

function CardFooter(props: ComponentProps<'div'>) {
  const rest = omit(props, 'class')
  return <div class={cn('flex items-center p-6 pt-0', props.class)} {...rest} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
