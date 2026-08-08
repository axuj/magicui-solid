import type { JSX } from 'solid-js'
import { createUniqueId, For, mergeProps, splitProps } from 'solid-js'
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
  const merged = mergeProps(
    { width: 40, height: 40, x: -1, y: -1, strokeDasharray: '0' },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'width',
    'height',
    'x',
    'y',
    'squares',
    'strokeDasharray',
    'class',
  ])
  const id = createUniqueId()

  return (
    <svg
      aria-hidden="true"
      class={cn(
        `
          pointer-events-none absolute inset-0 size-full fill-gray-400/30
          stroke-gray-400/30
        `,
        local.class,
      )}
      {...rest}
    >
      <defs>
        <pattern
          id={id}
          width={local.width}
          height={local.height}
          patternUnits="userSpaceOnUse"
          x={local.x}
          y={local.y}
        >
          <path
            d={`M.5 ${local.height}V.5H${local.width}`}
            fill="none"
            stroke-dasharray={local.strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" stroke-width={0} fill={`url(#${id})`} />
      {local.squares && (
        <svg x={local.x} y={local.y} class="overflow-visible">
          <For each={local.squares}>
            {([x, y]) => (
              <rect
                stroke-width="0"
                width={local.width - 1}
                height={local.height - 1}
                x={x * local.width + 1}
                y={y * local.height + 1}
              />
            )}
          </For>
        </svg>
      )}
    </svg>
  )
}
