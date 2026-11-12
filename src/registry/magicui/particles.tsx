import type { JSX } from '@solidjs/web'
import type { Accessor } from 'solid-js'

import { createEffect, createMemo, createSignal, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

interface MousePosition {
  x: number
  y: number
}

function createMousePosition(): Accessor<MousePosition> {
  const [mousePosition, setMousePosition] = createSignal<MousePosition>({ x: 0, y: 0 })

  onSettled(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => window.removeEventListener('mousemove', handleMouseMove)
  })

  return mousePosition
}

interface ParticlesProps extends JSX.HTMLAttributes<HTMLDivElement> {
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace('#', '')

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  const hexInt = Number.parseInt(hex, 16)
  const red = (hexInt >> 16) & 255
  const green = (hexInt >> 8) & 255
  const blue = hexInt & 255
  return [red, green, blue]
}

interface Circle {
  x: number
  y: number
  translateX: number
  translateY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
  magnetism: number
}

export function Particles(props: ParticlesProps) {
  const quantity = () => props.quantity ?? 100
  const staticity = () => props.staticity ?? 50
  const ease = () => props.ease ?? 50
  const size = () => props.size ?? 0.4
  const vx = () => props.vx ?? 0
  const vy = () => props.vy ?? 0
  // Cache the parsed fill colour; it is used on every frame.
  const rgb = createMemo(() => hexToRgb(props.color ?? '#ffffff'))

  const rest = omit(
    props,
    'class',
    'color',
    'quantity',
    'staticity',
    'ease',
    'size',
    'refresh',
    'vx',
    'vy',
  )

  const mousePosition = createMousePosition()

  let canvasRef: HTMLCanvasElement | undefined
  let containerRef: HTMLDivElement | undefined
  let context: CanvasRenderingContext2D | null = null
  let circles: Circle[] = []
  let dpr = 1
  let rafID: number | null = null
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null
  const mouse = { x: 0, y: 0 }
  const canvasSize = { w: 0, h: 0 }

  function circleParams(): Circle {
    return {
      x: Math.floor(Math.random() * canvasSize.w),
      y: Math.floor(Math.random() * canvasSize.h),
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + size(),
      alpha: 0,
      targetAlpha: Number.parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    }
  }

  function drawCircle(circle: Circle, update = false) {
    if (!context)
      return

    const { x, y, translateX, translateY, size: radius, alpha } = circle
    context.translate(translateX, translateY)
    context.beginPath()
    context.arc(x, y, radius, 0, 2 * Math.PI)
    context.fillStyle = `rgba(${rgb().join(', ')}, ${alpha})`
    context.fill()
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (!update)
      circles.push(circle)
  }

  function clearContext() {
    context?.clearRect(0, 0, canvasSize.w, canvasSize.h)
  }

  // Rebuild the canvas and reseed on first frame, resize and refresh.
  function resizeCanvas() {
    if (!containerRef || !canvasRef || !context)
      return

    canvasSize.w = containerRef.offsetWidth
    canvasSize.h = containerRef.offsetHeight

    canvasRef.width = canvasSize.w * dpr
    canvasRef.height = canvasSize.h * dpr
    canvasRef.style.width = `${canvasSize.w}px`
    canvasRef.style.height = `${canvasSize.h}px`
    // setTransform is idempotent; scale would compound across calls.
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    circles = []
    for (let i = 0; i < quantity(); i++)
      drawCircle(circleParams())
  }

  function remapValue(
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): number {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
    return remapped > 0 ? remapped : 0
  }

  function animate() {
    clearContext()
    circles.forEach((circle, i) => {
      // Fade out towards the canvas edges.
      const edge = [
        circle.x + circle.translateX - circle.size, // distance from left edge
        canvasSize.w - circle.x - circle.translateX - circle.size, // distance from right edge
        circle.y + circle.translateY - circle.size, // distance from top edge
        canvasSize.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
      ]
      const closestEdge = edge.reduce((a, b) => Math.min(a, b))
      const remapClosestEdge = Number.parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
      )
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02
        if (circle.alpha > circle.targetAlpha)
          circle.alpha = circle.targetAlpha
      }
      else {
        circle.alpha = circle.targetAlpha * remapClosestEdge
      }
      circle.x += circle.dx + vx()
      circle.y += circle.dy + vy()
      circle.translateX
        += (mouse.x / (staticity() / circle.magnetism) - circle.translateX) / ease()
      circle.translateY
        += (mouse.y / (staticity() / circle.magnetism) - circle.translateY) / ease()

      drawCircle(circle, true)

      // Replace particles that leave the canvas.
      if (
        circle.x < -circle.size
        || circle.x > canvasSize.w + circle.size
        || circle.y < -circle.size
        || circle.y > canvasSize.h + circle.size
      ) {
        circles.splice(i, 1)
        drawCircle(circleParams())
      }
    })
    rafID = window.requestAnimationFrame(animate)
  }

  function onMouseMove(position: MousePosition) {
    if (!canvasRef)
      return

    const rect = canvasRef.getBoundingClientRect()
    const { w, h } = canvasSize
    const x = position.x - rect.left - w / 2
    const y = position.y - rect.top - h / 2
    if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
      mouse.x = x
      mouse.y = y
    }
  }

  // Initialise once after mount; the RAF loop runs until disposal.
  onSettled(() => {
    const canvas = canvasRef
    if (!canvas)
      return

    dpr = window.devicePixelRatio || 1
    context = canvas.getContext('2d')

    const handleResize = () => {
      if (resizeTimeout)
        clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resizeCanvas, 200)
    }
    window.addEventListener('resize', handleResize)

    // Defer the first measurement by a frame: layout may not have settled
    // at onSettled. ResizeObserver would loop here, since the canvas
    // determines the container height.
    const initFrame = window.requestAnimationFrame(() => {
      resizeCanvas()
      animate()
    })

    return () => {
      window.cancelAnimationFrame(initFrame)
      if (rafID != null)
        window.cancelAnimationFrame(rafID)
      if (resizeTimeout)
        clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  })

  createEffect(() => props.refresh ?? false, () => resizeCanvas())
  // Pass the position through compute: the effect callback is untracked.
  createEffect(() => mousePosition(), position => onMouseMove(position))

  return (
    <div
      class={cn('pointer-events-none', props.class)}
      ref={containerRef}
      aria-hidden="true"
      {...rest}
    >
      <canvas ref={canvasRef} class="size-full" />
    </div>
  )
}
