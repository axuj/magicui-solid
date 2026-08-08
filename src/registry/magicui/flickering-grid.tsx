import type { JSX } from 'solid-js'
import { createEffect, createMemo, createSignal, mergeProps, onCleanup, splitProps } from 'solid-js'
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
  const merged = mergeProps(
    { squareSize: 4, gridGap: 6, flickerChance: 0.3, color: 'rgb(0, 0, 0)', maxOpacity: 0.3 },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'squareSize',
    'gridGap',
    'flickerChance',
    'color',
    'width',
    'height',
    'maxOpacity',
    'class',
  ])
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
    return toRGBA(local.color)
  })

  const setupCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const cols = Math.ceil(width / (local.squareSize + local.gridGap))
    const rows = Math.ceil(height / (local.squareSize + local.gridGap))

    const squares = new Float32Array(cols * rows)
    for (let i = 0; i < squares.length; i++) {
      squares[i] = Math.random() * local.maxOpacity
    }

    return { cols, rows, squares, dpr }
  }

  const updateSquares = (squares: Float32Array, deltaTime: number) => {
    for (let i = 0; i < squares.length; i++) {
      if (Math.random() < local.flickerChance * deltaTime) {
        squares[i] = Math.random() * local.maxOpacity
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
          i * (local.squareSize + local.gridGap) * dpr,
          j * (local.squareSize + local.gridGap) * dpr,
          local.squareSize * dpr,
          local.squareSize * dpr,
        )
      }
    }
  }

  createEffect(() => {
    const canvas = canvasRef
    const container = containerRef
    const ctx = canvas?.getContext('2d') ?? null
    let animationFrameId: number | null = null
    let resizeObserver: ResizeObserver | null = null
    let intersectionObserver: IntersectionObserver | null = null
    let gridParams: ReturnType<typeof setupCanvas> | null = null

    if (canvas && container && ctx) {
      const updateCanvasSize = () => {
        const newWidth = local.width || container.clientWidth
        const newHeight = local.height || container.clientHeight
        setCanvasSize({ width: newWidth, height: newHeight })
        gridParams = setupCanvas(canvas, newWidth, newHeight)
      }

      updateCanvasSize()

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
        updateCanvasSize()
      })
      resizeObserver.observe(container)

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting)
        },
        { threshold: 0 },
      )
      intersectionObserver.observe(canvas)

      if (isInView()) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    onCleanup(() => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
    })
  })

  return (
    <div
      ref={containerRef}
      class={cn(`
        size-full
        ${local.class}
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
