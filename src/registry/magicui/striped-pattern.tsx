import type { JSX } from '@solidjs/web'
import { createUniqueId, For, omit } from 'solid-js'

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
  const rest = omit(props, 'direction', 'width', 'height', 'class')
  const direction = () => props.direction ?? 'left' as const
  const id = createUniqueId()

  return (
    <svg
      aria-hidden="true"
      class={cn(
        'pointer-events-none absolute inset-0 z-10 size-full stroke-[0.5]',
        props.class,
      )}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <defs>
        <pattern
          id={id}
          width={(props.width ?? 10)}
          height={(props.height ?? 10)}
          patternUnits="userSpaceOnUse"
        >
          <For each={[-1, 0, 1]}>
            {i => (
              <line
                x1={i * (props.width ?? 10)}
                y1={direction() === 'left' ? (props.height ?? 10) : 0}
                x2={(i + 1) * (props.width ?? 10)}
                y2={direction() === 'left' ? 0 : (props.height ?? 10)}
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
