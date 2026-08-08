import type { JSX } from 'solid-js'
import { createSignal, For, mergeProps, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

export interface InteractiveGridPatternProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  squares?: [number, number]
  class?: string
  squaresClassName?: string
}

export function InteractiveGridPattern(props: InteractiveGridPatternProps) {
  const merged = mergeProps({ width: 40, height: 40, squares: [24, 24] }, props)
  const [local, rest] = splitProps(merged, [
    'width',
    'height',
    'squares',
    'class',
    'squaresClassName',
  ])
  const horizontal = () => local.squares[0]
  const vertical = () => local.squares[1]
  const [hoveredSquare, setHoveredSquare] = createSignal<number | null>(null)

  return (
    <svg
      width={local.width * horizontal()}
      height={local.height * vertical()}
      class={cn(
        'absolute inset-0 size-full border border-gray-400/30',
        local.class,
      )}
      {...rest}
    >
      <For each={Array.from({ length: horizontal() * vertical() })}>
        {(_, index) => (
          <rect
            x={(index() % horizontal()) * local.width}
            y={Math.floor(index() / horizontal()) * local.height}
            width={local.width}
            height={local.height}
            class={cn(
              `
                stroke-gray-400/30 transition-all duration-100 ease-in-out
                not-[&:hover]:duration-1000
              `,
              hoveredSquare() === index()
                ? 'fill-gray-300/30'
                : `fill-transparent`,
              local.squaresClassName,
            )}
            onMouseEnter={() => setHoveredSquare(index())}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        )}
      </For>
    </svg>
  )
}
