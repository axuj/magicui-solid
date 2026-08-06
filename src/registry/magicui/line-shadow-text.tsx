import type { JSX } from 'solid-js'
import { mergeProps, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '@/lib/utils'

type MotionElementType = keyof JSX.IntrinsicElements

interface LineShadowTextProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
  children: string
  shadowColor?: string
  as?: MotionElementType
}

export function LineShadowText(props: LineShadowTextProps) {
  const merged = mergeProps({ shadowColor: 'black', as: 'span' }, props)
  const [local, rest] = splitProps(merged, ['children', 'shadowColor', 'as', 'class'])

  return (
    <Dynamic
      component={local.as}
      style={{ '--shadow-color': local.shadowColor }}
      class={cn(
        `
          relative z-0 inline-flex
          after:absolute after:top-[0.04em] after:left-[0.04em] after:-z-10
          after:animate-line-shadow
          after:bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]
          after:bg-size-[0.06em_0.06em] after:bg-clip-text
          after:text-transparent after:content-[attr(data-text)]
        `,
        local.class,
      )}
      data-text={local.children}
      {...rest}
    >
      {local.children}
    </Dynamic>
  )
}
