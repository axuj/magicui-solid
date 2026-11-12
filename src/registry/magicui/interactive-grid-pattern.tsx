import type { JSX } from '@solidjs/web'
import { createSignal, For, omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface InteractiveGridPatternProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  squares?: [number, number]
  class?: string
  squaresClassName?: string
}

export function InteractiveGridPattern(props: InteractiveGridPatternProps) {
  const rest = omit(props, 'width', 'height', 'squares', 'class', 'squaresClassName')
  const squares = () => props.squares ?? [24, 24]
  const horizontal = () => squares()[0]
  const vertical = () => squares()[1]
  const [hoveredSquare, setHoveredSquare] = createSignal<number | null>(null)

  return (
    <svg
      width={(props.width ?? 40) * horizontal()}
      height={(props.height ?? 40) * vertical()}
      class={cn(
        'absolute inset-0 size-full border border-gray-400/30',
        props.class,
      )}
      {...rest}
    >
      <For each={Array.from({ length: horizontal() * vertical() })}>
        {(_, index) => (
          <rect
            x={(index() % horizontal()) * (props.width ?? 40)}
            y={Math.floor(index() / horizontal()) * (props.height ?? 40)}
            width={(props.width ?? 40)}
            height={(props.height ?? 40)}
            class={cn(
              `
                stroke-gray-400/30 transition-all duration-100 ease-in-out
                not-[&:hover]:duration-1000
              `,
              hoveredSquare() === index()
                ? 'fill-gray-300/30'
                : `fill-transparent`,
              props.squaresClassName,
            )}
            onMouseEnter={() => setHoveredSquare(index())}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        )}
      </For>
    </svg>
  )
}
