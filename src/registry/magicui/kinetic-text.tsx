import type { JSX, ValidComponent } from 'solid-js'
import { For, mergeProps, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '@/lib/utils'

type KineticTextProps = JSX.HTMLAttributes<HTMLElement> & {
  text: string
  as?: ValidComponent
}

export function KineticText(props: KineticTextProps) {
  const merged = mergeProps({ as: 'h1' }, props)
  const [local, rest] = splitProps(merged, ['text', 'as', 'class', 'style'])

  const mergedStyle = (): JSX.CSSProperties => ({
    '--hover-padding': 'calc(1em / 12)',
    '--text-stroke-width': 'calc(1em * 125 / 6000)',
    ...(local.style as JSX.CSSProperties | undefined),
  })

  return (
    <Dynamic
      component={local.as}
      {...rest}
      class={cn('flex flex-wrap font-light', local.class)}
      style={mergedStyle()}
    >
      <For each={local.text.split('')}>
        {letter => (
          <span
            aria-hidden="true"
            class="
              will-change-[font-weight,-webkit-text-stroke-width,padding]
              [-webkit-text-stroke-color:transparent]
              [-webkit-text-stroke-width:var(--text-stroke-width)]
              [transition:font-weight_0.4s,-webkit-text-stroke-color_0.4s,padding_0.4s]
              hover:px-(--hover-padding) hover:font-black
              hover:[-webkit-text-stroke-color:currentcolor]
              hover:[-webkit-text-stroke-width:calc(var(--text-stroke-width)*2)]
              has-[+span+span:hover]:font-normal
              has-[+span:hover]:px-(--hover-padding)
              has-[+span:hover]:font-semibold
              [:hover+&]:px-(--hover-padding) [:hover+&]:font-semibold
              [:hover+span+&]:font-normal
            "
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        )}
      </For>
      <span class="sr-only">{local.text}</span>
    </Dynamic>
  )
}
