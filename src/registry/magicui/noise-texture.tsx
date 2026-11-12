import type { JSX } from '@solidjs/web'
import { createUniqueId, omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface NoiseTextureProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  class?: string
  frequency?: number
  octaves?: number
  slope?: number
  noiseOpacity?: number
}

export function NoiseTexture(props: NoiseTextureProps) {
  const rest = omit(props, 'class', 'frequency', 'octaves', 'slope', 'noiseOpacity')
  const frequency = () => props.frequency ?? 0.4
  const noiseOpacity = () => props.noiseOpacity ?? 0.6
  const octaves = () => props.octaves ?? 6
  const filterId = createUniqueId()

  return (
    <svg
      class={cn(
        `
          pointer-events-none absolute inset-0 z-0 size-full opacity-50
          select-none
          dark:opacity-[0.75]
        `,
        props.class,
      )}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <filter id={filterId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency={frequency()}
          numOctaves={octaves()}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={(props.slope ?? 0.15)} />
          <feFuncG type="linear" slope={(props.slope ?? 0.15)} />
          <feFuncB type="linear" slope={(props.slope ?? 0.15)} />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} opacity={noiseOpacity()} />
    </svg>
  )
}
