import type { JSX } from 'solid-js'
import { createUniqueId, mergeProps, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

export interface NoiseTextureProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  class?: string
  frequency?: number
  octaves?: number
  slope?: number
  noiseOpacity?: number
}

export function NoiseTexture(props: NoiseTextureProps) {
  const merged = mergeProps(
    { frequency: 0.4, octaves: 6, slope: 0.15, noiseOpacity: 0.6 },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'class',
    'frequency',
    'octaves',
    'slope',
    'noiseOpacity',
  ])
  const filterId = createUniqueId()

  return (
    <svg
      class={cn(
        `
          pointer-events-none absolute inset-0 z-0 size-full opacity-50
          select-none
          dark:opacity-[0.75]
        `,
        local.class,
      )}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <filter id={filterId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency={local.frequency}
          numOctaves={local.octaves}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={local.slope} />
          <feFuncG type="linear" slope={local.slope} />
          <feFuncB type="linear" slope={local.slope} />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} opacity={local.noiseOpacity} />
    </svg>
  )
}
