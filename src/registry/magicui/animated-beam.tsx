import type { Accessor } from 'solid-js'
import { animate } from 'motion'
import { createEffect, createSignal, mergeProps, onCleanup, splitProps, untrack } from 'solid-js'
import { cn } from '@/lib/utils'

export interface AnimatedBeamProps {
  class?: string
  containerRef: Accessor<HTMLElement | undefined>
  fromRef: Accessor<HTMLElement | undefined>
  toRef: Accessor<HTMLElement | undefined>
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  delay?: number
  duration?: number
  repeat?: number
  repeatDelay?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

let gradientIdCounter = 0

export function AnimatedBeam(props: AnimatedBeamProps) {
  const id = `magicui-beam-${++gradientIdCounter}`
  const merged = mergeProps(
    {
      curvature: 0,
      reverse: false,
      duration: 5,
      delay: 0,
      pathColor: 'gray',
      pathWidth: 2,
      pathOpacity: 0.2,
      gradientStartColor: '#ffaa40',
      gradientStopColor: '#9c40ff',
      repeat: Infinity,
      repeatDelay: 0,
      startXOffset: 0,
      startYOffset: 0,
      endXOffset: 0,
      endYOffset: 0,
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'class',
    'curvature',
    'reverse',
    'duration',
    'delay',
    'pathColor',
    'pathWidth',
    'pathOpacity',
    'gradientStartColor',
    'gradientStopColor',
    'repeat',
    'repeatDelay',
    'startXOffset',
    'startYOffset',
    'endXOffset',
    'endYOffset',
    'containerRef',
    'fromRef',
    'toRef',
  ])

  const [pathD, setPathD] = createSignal('')
  const [svgWidth, setSvgWidth] = createSignal(0)
  const [svgHeight, setSvgHeight] = createSignal(0)
  let gradientRef: SVGLinearGradientElement | undefined

  const gradientCoordinates = untrack(() => local.reverse)
    ? {
        x1: ['90%', '-10%'],
        x2: ['100%', '0%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%'],
      }
    : {
        x1: ['10%', '110%'],
        x2: ['0%', '100%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%'],
      }

  createEffect(() => {
    const containerEl = local.containerRef()
    const fromEl = local.fromRef()
    const toEl = local.toRef()
    if (!containerEl || !fromEl || !toEl)
      return

    const updatePath = () => {
      const containerRect = containerEl.getBoundingClientRect()
      const rectA = fromEl.getBoundingClientRect()
      const rectB = toEl.getBoundingClientRect()

      setSvgWidth(containerRect.width)
      setSvgHeight(containerRect.height)

      const startX = rectA.left - containerRect.left + rectA.width / 2 + local.startXOffset
      const startY = rectA.top - containerRect.top + rectA.height / 2 + local.startYOffset
      const endX = rectB.left - containerRect.left + rectB.width / 2 + local.endXOffset
      const endY = rectB.top - containerRect.top + rectB.height / 2 + local.endYOffset

      const controlY = startY - local.curvature
      const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`
      setPathD(d)
    }

    const resizeObserver = new ResizeObserver(updatePath)
    resizeObserver.observe(containerEl)
    updatePath()
    onCleanup(() => resizeObserver.disconnect())
  })

  createEffect(() => {
    if (!gradientRef)
      return
    const animation = animate(
      gradientRef,
      {
        x1: gradientCoordinates.x1,
        x2: gradientCoordinates.x2,
        y1: gradientCoordinates.y1,
        y2: gradientCoordinates.y2,
      },
      {
        delay: local.delay,
        duration: local.duration,
        ease: [0.16, 1, 0.3, 1],
        repeat: local.repeat,
        repeatDelay: local.repeatDelay,
      },
    )
    onCleanup(() => animation.stop())
  })

  return (
    <svg
      fill="none"
      width={svgWidth()}
      height={svgHeight()}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Animated beam"
      class={cn(`
        pointer-events-none absolute top-0 left-0 transform-gpu stroke-2
      `, local.class)}
      viewBox={`0 0 ${svgWidth()} ${svgHeight()}`}
      {...rest}
    >
      <path
        d={pathD()}
        stroke={local.pathColor}
        stroke-width={local.pathWidth}
        stroke-opacity={local.pathOpacity}
        stroke-linecap="round"
      />
      <path
        d={pathD()}
        stroke-width={local.pathWidth}
        stroke={`url(#${id})`}
        stroke-opacity="1"
        stroke-linecap="round"
      />
      <defs>
        <linearGradient ref={gradientRef} id={id} gradientUnits="userSpaceOnUse">
          <stop stop-color={local.gradientStartColor} stop-opacity="0" />
          <stop stop-color={local.gradientStartColor} />
          <stop offset="32.5%" stop-color={local.gradientStopColor} />
          <stop offset="100%" stop-color={local.gradientStopColor} stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
