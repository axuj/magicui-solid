import type { JSX, ValidComponent } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'

import { For, omit } from 'solid-js'

import { cn } from '@/lib/utils'

type KineticTextProps = JSX.HTMLAttributes<HTMLElement> & {
  text: string
  as?: ValidComponent
}

export function KineticText(props: KineticTextProps) {
  const rest = omit(props, 'text', 'as', 'class', 'style')

  const mergedStyle = (): JSX.CSSProperties => ({
    '--hover-padding': 'calc(1em / 12)',
    '--text-stroke-width': 'calc(1em * 125 / 6000)',
    ...(props.style as JSX.CSSProperties | undefined),
  })

  return (
    <Dynamic
      component={(props.as ?? 'h1')}
      {...rest}
      class={cn('flex flex-wrap font-light', props.class)}
      style={mergedStyle()}
    >
      <For each={props.text.split('')}>
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
      <span class="sr-only">{props.text}</span>
    </Dynamic>
  )
}
