import type { JSX } from 'solid-js'
import { For, mergeProps, splitProps } from 'solid-js'
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
  const merged = mergeProps({ reverse: false, pauseOnHover: false, vertical: false, repeat: 4 }, props)
  const [local, rest] = splitProps(merged, ['reverse', 'pauseOnHover', 'children', 'vertical', 'repeat', 'class'])

  return (
    <div
      class={cn(
        'group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]',
        {
          'flex-row': !local.vertical,
          'flex-col': local.vertical,
        },
        local.class,
      )}
      {...rest}
    >
      <For each={Array.from({ length: local.repeat })}>
        {() => (
          <div
            class={cn('flex shrink-0 justify-around gap-(--gap)', {
              'animate-marquee flex-row': !local.vertical,
              'animate-marquee-vertical flex-col': local.vertical,
              'group-hover:[animation-play-state:paused]': local.pauseOnHover,
              '[animation-direction:reverse]': local.reverse,
            })}
          >
            {local.children}
          </div>
        )}
      </For>
    </div>
  )
}
