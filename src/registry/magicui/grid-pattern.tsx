import type { JSX } from '@solidjs/web'
import { createUniqueId, For, omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface GridPatternProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  squares?: Array<[x: number, y: number]>
  strokeDasharray?: string
}

/**
 * GridPattern Component
 *
 * A Solid component that creates a grid pattern background using SVG.
 */
export function GridPattern(props: GridPatternProps) {
  const rest = omit(props, 'width', 'height', 'x', 'y', 'squares', 'strokeDasharray', 'class')
  const strokeDasharray = () => props.strokeDasharray ?? '0'
  const id = createUniqueId()

  return (
    <svg
      aria-hidden="true"
      class={cn(
        `
          pointer-events-none absolute inset-0 size-full fill-gray-400/30
          stroke-gray-400/30
        `,
        props.class,
      )}
      {...rest}
    >
      <defs>
        <pattern
          id={id}
          width={(props.width ?? 40)}
          height={(props.height ?? 40)}
          patternUnits="userSpaceOnUse"
          x={(props.x ?? -1)}
          y={(props.y ?? -1)}
        >
          <path
            d={`M.5 ${(props.height ?? 40)}V.5H${(props.width ?? 40)}`}
            fill="none"
            stroke-dasharray={strokeDasharray()}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" stroke-width={0} fill={`url(#${id})`} />
      {props.squares && (
        <svg x={(props.x ?? -1)} y={(props.y ?? -1)} class="overflow-visible">
          <For each={props.squares}>
            {([x, y]) => (
              <rect
                stroke-width="0"
                width={(props.width ?? 40) - 1}
                height={(props.height ?? 40) - 1}
                x={x * (props.width ?? 40) + 1}
                y={y * (props.height ?? 40) + 1}
              />
            )}
          </For>
        </svg>
      )}
    </svg>
  )
}
