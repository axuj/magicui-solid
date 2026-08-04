import type { JSX } from 'solid-js'
import { children, createMemo, Index, mergeProps, Show, splitProps } from 'solid-js'

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
  const merged = mergeProps({ duration: 20, radius: 160, path: true, iconSize: 30, speed: 1 }, props)
  const [local, rest] = splitProps(merged, ['className', 'children', 'reverse', 'duration', 'radius', 'path', 'iconSize', 'speed'])

  const kids = children(() => local.children)
  const items = createMemo(() => kids.toArray())
  const calculatedDuration = () => local.duration / local.speed

  return (
    <>
      <Show when={local.path}>
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
            r={local.radius}
            fill="none"
          />
        </svg>
      </Show>
      <Index each={items()}>
        {(child, index) => {
          return (
            <div
              style={
                {
                  '--duration': calculatedDuration(),
                  '--radius': local.radius,
                  '--angle': (360 / items().length) * index,
                  '--icon-size': `${local.iconSize}px`,
                } as JSX.CSSProperties
              }
              class={cn(
                `
                  absolute flex size-(--icon-size) transform-gpu animate-orbit
                  items-center justify-center rounded-full
                `,
                { '[animation-direction:reverse]': local.reverse },
                local.className,
              )}
              {...rest}
            >
              {child()}
            </div>
          )
        }}
      </Index>
    </>
  )
}
