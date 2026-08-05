import type { Accessor, JSX } from 'solid-js'
import {
  createEffect,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  splitProps,
  untrack,
} from 'solid-js'

import { cn } from '@/lib/utils'

interface MousePosition {
  x: number
  y: number
}

function createMousePosition(): Accessor<MousePosition> {
  const [mousePosition, setMousePosition] = createSignal<MousePosition>({ x: 0, y: 0 })

  createEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    onCleanup(() => {
      window.removeEventListener('mousemove', handleMouseMove)
    })
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
  const merged = mergeProps(
    {
      quantity: 100,
      staticity: 50,
      ease: 50,
      size: 0.4,
      refresh: false,
      color: '#ffffff',
      vx: 0,
      vy: 0,
    },
    props,
  )
  const [local, rest] = splitProps(merged, ['class', 'color', 'quantity', 'staticity', 'ease', 'size', 'refresh', 'vx', 'vy'])

  const mousePosition = createMousePosition()

  let canvasRef: HTMLCanvasElement | undefined
  let canvasContainerRef: HTMLDivElement | undefined
  let context: CanvasRenderingContext2D | null = null
  let circles: Circle[] = []
  const mouse = { x: 0, y: 0 }
  const canvasSize = { w: 0, h: 0 }
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1
  let rafID: number | null = null
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null
  let rgb = hexToRgb(untrack(() => local.color))

  createEffect(on(() => local.color, () => {
    rgb = hexToRgb(local.color)
    if (canvasRef)
      context = canvasRef.getContext('2d')

    initCanvas()
    animate()

    const handleResize = () => {
      if (resizeTimeout)
        clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        initCanvas()
      }, 200)
    }

    window.addEventListener('resize', handleResize)

    onCleanup(() => {
      if (rafID != null)
        window.cancelAnimationFrame(rafID)
      if (resizeTimeout)
        clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    })
  }))

  createEffect(on(mousePosition, () => {
    onMouseMove()
  }))

  createEffect(on(() => local.refresh, () => {
    initCanvas()
  }))

  function initCanvas() {
    resizeCanvas()
    drawParticles()
  }

  function onMouseMove() {
    if (canvasRef) {
      const rect = canvasRef.getBoundingClientRect()
      const { w, h } = canvasSize
      const x = mousePosition().x - rect.left - w / 2
      const y = mousePosition().y - rect.top - h / 2
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2
      if (inside) {
        mouse.x = x
        mouse.y = y
      }
    }
  }

  function resizeCanvas() {
    if (canvasContainerRef && canvasRef && context) {
      canvasSize.w = canvasContainerRef.offsetWidth
      canvasSize.h = canvasContainerRef.offsetHeight

      canvasRef.width = canvasSize.w * dpr
      canvasRef.height = canvasSize.h * dpr
      canvasRef.style.width = `${canvasSize.w}px`
      canvasRef.style.height = `${canvasSize.h}px`
      context.scale(dpr, dpr)

      circles = []
      for (let i = 0; i < local.quantity; i++) {
        const circle = circleParams()
        drawCircle(circle)
      }
    }
  }

  function circleParams(): Circle {
    const x = Math.floor(Math.random() * canvasSize.w)
    const y = Math.floor(Math.random() * canvasSize.h)
    const translateX = 0
    const translateY = 0
    const pSize = Math.floor(Math.random() * 2) + local.size
    const alpha = 0
    const targetAlpha = Number.parseFloat((Math.random() * 0.6 + 0.1).toFixed(1))
    const dx = (Math.random() - 0.5) * 0.1
    const dy = (Math.random() - 0.5) * 0.1
    const magnetism = 0.1 + Math.random() * 4
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    }
  }

  function drawCircle(circle: Circle, update = false) {
    if (context) {
      const { x, y, translateX, translateY, size, alpha } = circle
      context.translate(translateX, translateY)
      context.beginPath()
      context.arc(x, y, size, 0, 2 * Math.PI)
      context.fillStyle = `rgba(${rgb.join(', ')}, ${alpha})`
      context.fill()
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!update)
        circles.push(circle)
    }
  }

  function clearContext() {
    if (context)
      context.clearRect(0, 0, canvasSize.w, canvasSize.h)
  }

  function drawParticles() {
    clearContext()
    const particleCount = local.quantity
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams()
      drawCircle(circle)
    }
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
      // Handle the alpha value
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
      circle.x += circle.dx + local.vx
      circle.y += circle.dy + local.vy
      circle.translateX
        += (mouse.x / (local.staticity / circle.magnetism) - circle.translateX) / local.ease
      circle.translateY
        += (mouse.y / (local.staticity / circle.magnetism) - circle.translateY) / local.ease

      drawCircle(circle, true)

      // circle gets out of the canvas
      if (
        circle.x < -circle.size
        || circle.x > canvasSize.w + circle.size
        || circle.y < -circle.size
        || circle.y > canvasSize.h + circle.size
      ) {
        // remove the circle from the array
        circles.splice(i, 1)
        // create a new circle
        const newCircle = circleParams()
        drawCircle(newCircle)
      }
    })
    rafID = window.requestAnimationFrame(animate)
  }

  return (
    <div
      class={cn('pointer-events-none', local.class)}
      ref={canvasContainerRef}
      aria-hidden="true"
      {...rest}
    >
      <canvas ref={canvasRef} class="size-full" />
    </div>
  )
}
