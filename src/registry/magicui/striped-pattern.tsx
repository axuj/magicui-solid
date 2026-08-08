import type { JSX } from 'solid-js'
import { createUniqueId, For, mergeProps, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export interface StripedPatternProps
  extends Omit<JSX.SvgSVGAttributes<SVGSVGElement>, 'direction'> {
  direction?: 'left' | 'right'
  width?: number
  height?: number
}

/**
 * StripedPattern Component
 *
 * A Solid component that creates a striped pattern background using SVG.
 */
export function StripedPattern(props: StripedPatternProps) {
  const merged = mergeProps({ direction: 'left' as const, width: 10, height: 10 }, props)
  const [local, rest] = splitProps(merged, ['direction', 'width', 'height', 'class'])
  const id = createUniqueId()

  return (
    <svg
      aria-hidden="true"
      class={cn(
        'pointer-events-none absolute inset-0 z-10 size-full stroke-[0.5]',
        local.class,
      )}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <defs>
        <pattern
          id={id}
          width={local.width}
          height={local.height}
          patternUnits="userSpaceOnUse"
        >
          <For each={[-1, 0, 1]}>
            {i => (
              <line
                x1={i * local.width}
                y1={local.direction === 'left' ? local.height : 0}
                x2={(i + 1) * local.width}
                y2={local.direction === 'left' ? 0 : local.height}
                stroke="currentColor"
              />
            )}
          </For>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
