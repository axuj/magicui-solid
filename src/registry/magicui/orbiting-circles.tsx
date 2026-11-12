import type { JSX } from '@solidjs/web'
import { children, createMemo, For, omit, Show } from 'solid-js'

import { cn } from '@/lib/utils'

export interface OrbitingCirclesProps extends JSX.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: JSX.Element
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
  iconSize?: number
  speed?: number
}

export function OrbitingCircles(props: OrbitingCirclesProps) {
  const duration = () => props.duration ?? 20
  const radius = () => props.radius ?? 160
  const showPath = () => props.path ?? true
  const iconSize = () => props.iconSize ?? 30
  const speed = () => props.speed ?? 1

  const rest = omit(
    props,
    'className',
    'children',
    'reverse',
    'duration',
    'radius',
    'path',
    'iconSize',
    'speed',
  )

  const kids = children(() => props.children)
  const items = createMemo(() => kids.toArray())
  const calculatedDuration = () => duration() / speed()

  return (
    <>
      <Show when={showPath()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            class="
              stroke-black/10 stroke-1
              dark:stroke-white/10
            "
            cx="50%"
            cy="50%"
            r={radius()}
            fill="none"
          />
        </svg>
      </Show>
      <For each={items()} keyed={false}>
        {(child, index) => (
          <div
            style={
              {
                '--duration': calculatedDuration(),
                '--radius': radius(),
                '--angle': (360 / items().length) * index,
                '--icon-size': `${iconSize()}px`,
              } as JSX.CSSProperties
            }
            class={cn(
              `
                absolute flex size-(--icon-size) transform-gpu animate-orbit
                items-center justify-center rounded-full
              `,
              { '[animation-direction:reverse]': props.reverse },
              props.className,
            )}
            {...rest}
          >
            {child()}
          </div>
        )}
      </For>
    </>
  )
}
