import type { Accessor } from 'solid-js'

import { animate } from 'motion'
import { createEffect, createSignal, createUniqueId, omit } from 'solid-js'

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

export function AnimatedBeam(props: AnimatedBeamProps) {
  const id = createUniqueId()
  const rest = omit(props, 'class', 'curvature', 'reverse', 'duration', 'delay', 'pathColor', 'pathWidth', 'pathOpacity', 'gradientStartColor', 'gradientStopColor', 'repeat', 'repeatDelay', 'startXOffset', 'startYOffset', 'endXOffset', 'endYOffset', 'containerRef', 'fromRef', 'toRef')
  const curvature = () => props.curvature ?? 0
  const endXOffset = () => props.endXOffset ?? 0
  const endYOffset = () => props.endYOffset ?? 0
  const gradientStartColor = () => props.gradientStartColor ?? '#ffaa40'
  const gradientStopColor = () => props.gradientStopColor ?? '#9c40ff'
  const pathColor = () => props.pathColor ?? 'gray'
  const pathOpacity = () => props.pathOpacity ?? 0.2
  const pathWidth = () => props.pathWidth ?? 2
  const reverse = () => props.reverse ?? false
  const startXOffset = () => props.startXOffset ?? 0
  const startYOffset = () => props.startYOffset ?? 0

  const [pathD, setPathD] = createSignal('')
  const [svgWidth, setSvgWidth] = createSignal(0)
  const [svgHeight, setSvgHeight] = createSignal(0)
  let gradientRef: SVGLinearGradientElement | undefined

  // Takes `reverse` explicitly: the caller reads it inside the effect's compute,
  // so this stays a pure value factory with no reactive reads of its own.
  const gradientCoordinates = (reverseValue: boolean) =>
    reverseValue
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

  createEffect(() => [
    props.containerRef(),
    props.fromRef(),
    props.toRef(),
    curvature(),
    startXOffset(),
    startYOffset(),
    endXOffset(),
    endYOffset(),
  ], ([containerEl, fromEl, toEl, curvatureValue, startXOffsetValue, startYOffsetValue, endXOffsetValue, endYOffsetValue]) => {
    if (!containerEl || !fromEl || !toEl)
      return

    const updatePath = (
      startXOffset: number,
      startYOffset: number,
      endXOffset: number,
      endYOffset: number,
      curvature: number,
    ) => {
      const containerRect = containerEl.getBoundingClientRect()
      const rectA = fromEl.getBoundingClientRect()
      const rectB = toEl.getBoundingClientRect()

      setSvgWidth(containerRect.width)
      setSvgHeight(containerRect.height)

      const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset
      const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset
      const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset
      const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset

      const controlY = startY - curvature
      const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`
      setPathD(d)
    }

    const resizeObserver = new ResizeObserver(() => {
      updatePath(startXOffset(), startYOffset(), endXOffset(), endYOffset(), curvature())
    })
    resizeObserver.observe(containerEl)
    updatePath(startXOffsetValue, startYOffsetValue, endXOffsetValue, endYOffsetValue, curvatureValue)
    return () => resizeObserver.disconnect()
  })

  createEffect(() => [
    reverse(),
    props.delay,
    props.duration,
    props.repeat,
    props.repeatDelay,
  ], ([reverse, delay, duration, repeat, repeatDelay]) => {
    if (!gradientRef)
      return
    const animation = animate(
      gradientRef,
      gradientCoordinates(reverse),
      {
        delay: delay ?? 0,
        duration: duration ?? 5,
        ease: [0.16, 1, 0.3, 1],
        repeat: repeat ?? Infinity,
        repeatDelay: repeatDelay ?? 0,
      },
    )
    return () => animation.stop()
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
      `, props.class)}
      viewBox={`0 0 ${svgWidth()} ${svgHeight()}`}
      {...rest}
    >
      <path
        d={pathD()}
        stroke={pathColor()}
        stroke-width={pathWidth()}
        stroke-opacity={pathOpacity()}
        stroke-linecap="round"
      />
      <path
        d={pathD()}
        stroke-width={pathWidth()}
        stroke={`url(#${id})`}
        stroke-opacity="1"
        stroke-linecap="round"
      />
      <defs>
        <linearGradient ref={gradientRef} id={id} gradientUnits="userSpaceOnUse">
          <stop stop-color={gradientStartColor()} stop-opacity="0" />
          <stop stop-color={gradientStartColor()} />
          <stop offset="32.5%" stop-color={gradientStopColor()} />
          <stop offset="100%" stop-color={gradientStopColor()} stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
