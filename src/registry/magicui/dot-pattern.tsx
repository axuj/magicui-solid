import type { JSX } from 'solid-js'
import { animate } from 'motion'
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  mergeProps,
  onCleanup,
  splitProps,
} from 'solid-js'
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

  createEffect(() => {
    if (!props.glow || !ref)
      return
    const anim = animate(
      ref,
      {
        opacity: [0.4, 1, 0.4],
        scale: [1, 1.5, 1],
      },
      {
        duration: props.duration,
        repeat: Infinity,
        repeatType: 'reverse',
        delay: props.delay,
        ease: 'easeInOut',
      },
    )
    onCleanup(() => anim.stop())
  })

  return <circle ref={ref} cx={props.x} cy={props.y} r={props.r} fill={props.fill} />
}

/**
 * DotPattern Component
 *
 * A Solid component that creates an animated or static dot pattern background using SVG.
 * The pattern automatically adjusts to fill its container and can optionally display glowing dots.
 */
export function DotPattern(props: DotPatternProps) {
  const merged = mergeProps(
    { width: 16, height: 16, x: 0, y: 0, cx: 1, cy: 1, cr: 1, glow: false },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'width',
    'height',
    'x',
    'y',
    'cx',
    'cy',
    'cr',
    'glow',
    'class',
  ])
  const id = createUniqueId()
  let svgRef: SVGSVGElement | undefined
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 })

  createEffect(() => {
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
    onCleanup(() => window.removeEventListener('resize', updateDimensions))
  })

  const dots = createMemo(() => {
    const width = local.width
    const height = local.height
    const cx = local.cx
    const cy = local.cy
    const x = local.x
    const y = local.y
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
        local.class,
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
            r={local.cr}
            fill={local.glow ? `url(#${id}-gradient)` : 'currentColor'}
            delay={dot.delay}
            duration={dot.duration}
            glow={local.glow}
          />
        )}
      </For>
    </svg>
  )
}
