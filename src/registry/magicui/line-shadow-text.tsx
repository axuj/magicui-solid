import type { JSX, ValidComponent } from '@solidjs/web'

import { Dynamic } from '@solidjs/web'
import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

interface LineShadowTextProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
  children: string
  shadowColor?: string
  as?: ValidComponent
}

export function LineShadowText(props: LineShadowTextProps) {
  const rest = omit(props, 'children', 'shadowColor', 'as', 'class')
  const as = () => props.as ?? 'span'
  const shadowColor = () => props.shadowColor ?? 'black'

  return (
    <Dynamic
      component={as()}
      style={{ '--shadow-color': shadowColor() }}
      class={cn(
        `
          relative z-0 inline-flex
          after:absolute after:top-[0.04em] after:left-[0.04em] after:-z-10
          after:animate-line-shadow
          after:bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]
          after:bg-size-[0.06em_0.06em] after:bg-clip-text
          after:text-transparent after:content-[attr(data-text)]
        `,
        props.class,
      )}
      data-text={props.children}
      {...rest}
    >
      {props.children}
    </Dynamic>
  )
}
