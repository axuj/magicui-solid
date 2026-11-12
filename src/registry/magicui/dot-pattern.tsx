import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { createEffect, createMemo, createSignal, createUniqueId, For, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

export interface DotPatternProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  glow?: boolean
}

function PatternDot(props: { x: number, y: number, r: number, fill: string, delay: number, duration: number, glow: boolean }) {
  let ref: SVGCircleElement | undefined

  createEffect(
    () => ({ glow: props.glow, duration: props.duration, delay: props.delay }),
    ({ glow, duration, delay }) => {
      if (!glow || !ref)
        return
      const anim = animate(
        ref,
        {
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.5, 1],
        },
        {
          duration,
          repeat: Infinity,
          repeatType: 'reverse',
          delay,
          ease: 'easeInOut',
        },
      )
      return () => anim.stop()
    },
  )

  return <circle ref={ref} cx={props.x} cy={props.y} r={props.r} fill={props.fill} />
}

/**
 * DotPattern Component
 *
 * A Solid component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 */
export function DotPattern(props: DotPatternProps) {
  const rest = omit(props, 'width', 'height', 'x', 'y', 'cx', 'cy', 'cr', 'glow', 'class')
  const cr = () => props.cr ?? 1
  const id = createUniqueId()
  let svgRef: SVGSVGElement | undefined
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 })

  onSettled(() => {
    if (!svgRef)
      return
    const updateDimensions = () => {
      if (svgRef) {
        const { width, height } = svgRef.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  })

  const dots = createMemo(() => {
    const width = (props.width ?? 16)
    const height = (props.height ?? 16)
    const cx = (props.cx ?? 1)
    const cy = (props.cy ?? 1)
    const x = (props.x ?? 0)
    const y = (props.y ?? 0)
    const cols = Math.ceil(dimensions().width / width)
    const rows = Math.ceil(dimensions().height / height)
    return Array.from({ length: cols * rows }, (_, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      return {
        x: col * width + cx + x,
        y: row * height + cy + y,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      }
    })
  })

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      class={cn(
        'pointer-events-none absolute inset-0 size-full text-neutral-400/80',
        props.class,
      )}
      {...rest}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stop-color="currentColor" stop-opacity="1" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </radialGradient>
      </defs>
      <For each={dots()}>
        {dot => (
          <PatternDot
            x={dot.x}
            y={dot.y}
            r={cr()}
            fill={(props.glow ?? false) ? `url(#${id}-gradient)` : 'currentColor'}
            delay={dot.delay}
            duration={dot.duration}
            glow={(props.glow ?? false)}
          />
        )}
      </For>
    </svg>
  )
}
