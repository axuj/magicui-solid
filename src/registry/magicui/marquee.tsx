import type { JSX } from '@solidjs/web'
import { For, omit } from 'solid-js'

import { cn } from '@/lib/utils'

interface MarqueeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional CSS class name to apply custom styles
   */
  class?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: JSX.Element
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
}

export function Marquee(props: MarqueeProps) {
  const vertical = () => props.vertical ?? false
  const repeat = () => props.repeat ?? 4

  // Forward every prop the component does not consume to the root div.
  const rest = omit(props, 'class', 'reverse', 'pauseOnHover', 'children', 'vertical', 'repeat')

  return (
    <div
      class={cn(`
        group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]
      `, {
        'flex-row': !vertical(),
        'flex-col': vertical(),
      }, props.class)}
      {...rest}
    >
      <For each={Array.from({ length: repeat() })}>
        {() => (
          <div
            class={cn('flex shrink-0 justify-around gap-(--gap)', {
              'animate-marquee flex-row': !vertical(),
              'animate-marquee-vertical flex-col': vertical(),
              'group-hover:[animation-play-state:paused]': props.pauseOnHover ?? false,
              '[animation-direction:reverse]': props.reverse ?? false,
            })}
          >
            {props.children}
          </div>
        )}
      </For>
    </div>
  )
}
