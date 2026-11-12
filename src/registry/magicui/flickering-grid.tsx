import type { JSX } from '@solidjs/web'
import { createEffect, createMemo, createSignal, omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface FlickeringGridProps extends JSX.HTMLAttributes<HTMLDivElement> {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  maxOpacity?: number
}

export function FlickeringGrid(props: FlickeringGridProps) {
  const rest = omit(props, 'squareSize', 'gridGap', 'flickerChance', 'color', 'width', 'height', 'maxOpacity', 'class')
  const flickerChance = () => props.flickerChance ?? 0.3
  const gridGap = () => props.gridGap ?? 6
  const maxOpacity = () => props.maxOpacity ?? 0.3
  const squareSize = () => props.squareSize ?? 4
  let canvasRef: HTMLCanvasElement | undefined
  let containerRef: HTMLDivElement | undefined
  const [isInView, setIsInView] = createSignal(false)
  const [canvasSize, setCanvasSize] = createSignal({ width: 0, height: 0 })

  const memoizedColor = createMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === 'undefined') {
        return `rgba(0, 0, 0,`
      }
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return 'rgba(255, 0, 0,'
      }
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
      return `rgba(${r}, ${g}, ${b},`
    }
    return toRGBA((props.color ?? 'rgb(0, 0, 0)'))
  })

  const setupCanvas = (canvas: HTMLCanvasElement, width: number, height: number, squareSize: number, gridGap: number, maxOpacity: number) => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const cols = Math.ceil(width / (squareSize + gridGap))
    const rows = Math.ceil(height / (squareSize + gridGap))

    const squares = new Float32Array(cols * rows)
    for (let i = 0; i < squares.length; i++) {
      squares[i] = Math.random() * maxOpacity
    }

    return { cols, rows, squares, dpr }
  }

  const updateSquares = (squares: Float32Array, deltaTime: number) => {
    for (let i = 0; i < squares.length; i++) {
      if (Math.random() < flickerChance() * deltaTime) {
        squares[i] = Math.random() * maxOpacity()
      }
    }
  }

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cols: number,
    rows: number,
    squares: Float32Array,
    dpr: number,
  ) => {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, width, height)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const opacity = squares[i * rows + j]
        ctx.fillStyle = `${memoizedColor()}${opacity})`
        ctx.fillRect(
          i * (squareSize() + gridGap()) * dpr,
          j * (squareSize() + gridGap()) * dpr,
          squareSize() * dpr,
          squareSize() * dpr,
        )
      }
    }
  }

  createEffect(
    () => ({ width: props.width, height: props.height, squareSize: squareSize(), gridGap: gridGap(), maxOpacity: maxOpacity(), flickerChance: flickerChance(), memoizedColor: memoizedColor(), isInView: isInView() }),
    ({ width, height, squareSize, gridGap, maxOpacity, isInView: isInViewValue }) => {
      const canvas = canvasRef
      const container = containerRef
      const ctx = canvas?.getContext('2d') ?? null
      let animationFrameId: number | null = null
      let resizeObserver: ResizeObserver | null = null
      let intersectionObserver: IntersectionObserver | null = null
      let gridParams: ReturnType<typeof setupCanvas> | null = null

      if (canvas && container && ctx) {
        const updateCanvasSize = (width: number | undefined, height: number | undefined) => {
          const newWidth = width || container.clientWidth
          const newHeight = height || container.clientHeight
          setCanvasSize({ width: newWidth, height: newHeight })
          gridParams = setupCanvas(canvas, newWidth, newHeight, squareSize, gridGap, maxOpacity)
        }

        updateCanvasSize(width, height)

        let lastTime = 0
        const animate = (time: number) => {
          if (!isInView() || !gridParams) {
            return
          }

          const deltaTime = (time - lastTime) / 1000
          lastTime = time

          updateSquares(gridParams.squares, deltaTime)
          drawGrid(
            ctx,
            canvas.width,
            canvas.height,
            gridParams.cols,
            gridParams.rows,
            gridParams.squares,
            gridParams.dpr,
          )
          animationFrameId = requestAnimationFrame(animate)
        }

        resizeObserver = new ResizeObserver(() => {
          updateCanvasSize(props.width, props.height)
        })
        resizeObserver.observe(container)

        intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            setIsInView(entry.isIntersecting)
          },
          { threshold: 0 },
        )
        intersectionObserver.observe(canvas)

        if (isInViewValue) {
          animationFrameId = requestAnimationFrame(animate)
        }
      }

      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
        }
        resizeObserver?.disconnect()
        intersectionObserver?.disconnect()
      }
    },
  )

  return (
    <div
      ref={containerRef}
      class={cn(`
        size-full
        ${props.class}
      `)}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        class="pointer-events-none"
        style={{ width: `${canvasSize().width}px`, height: `${canvasSize().height}px` }}
      />
    </div>
  )
}
