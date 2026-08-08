import { createEffect, createMemo, createSignal, For, mergeProps, onCleanup, onMount } from 'solid-js'

import { cn } from '@/lib/utils'

interface Grid {
  rows: number
  cols: number
}

const DEFAULT_GRIDS: Record<string, Grid> = {
  '6x4': { rows: 4, cols: 6 },
  '8x8': { rows: 8, cols: 8 },
  '8x3': { rows: 3, cols: 8 },
  '4x6': { rows: 6, cols: 4 },
  '3x8': { rows: 8, cols: 3 },
}

type PredefinedGridKey = keyof typeof DEFAULT_GRIDS

interface PixelImageProps {
  src: string
  grid?: PredefinedGridKey
  customGrid?: Grid
  grayscaleAnimation?: boolean
  pixelFadeInDuration?: number // in ms
  maxAnimationDelay?: number // in ms
  colorRevealDelay?: number // in ms
}

export function PixelImage(props: PixelImageProps) {
  const merged = mergeProps(
    {
      grid: '6x4' as PredefinedGridKey,
      grayscaleAnimation: true,
      pixelFadeInDuration: 1000,
      maxAnimationDelay: 1200,
      colorRevealDelay: 1300,
    },
    props,
  )
  const [isVisible, setIsVisible] = createSignal(false)
  const [showColor, setShowColor] = createSignal(false)

  const MIN_GRID = 1
  const MAX_GRID = 16

  const grid = createMemo(() => {
    const isValidGrid = (grid?: Grid) => {
      if (!grid)
        return false
      const { rows, cols } = grid
      return (
        Number.isInteger(rows)
        && Number.isInteger(cols)
        && rows >= MIN_GRID
        && cols >= MIN_GRID
        && rows <= MAX_GRID
        && cols <= MAX_GRID
      )
    }

    return isValidGrid(merged.customGrid) ? merged.customGrid! : DEFAULT_GRIDS[merged.grid]
  })

  const pieces = createMemo(() => {
    const { rows, cols } = grid()
    const total = rows * cols
    const maxDelay = merged.maxAnimationDelay
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols

      const clipPath = `polygon(
        ${col * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${row * (100 / rows)}%,
        ${(col + 1) * (100 / cols)}% ${(row + 1) * (100 / rows)}%,
        ${col * (100 / cols)}% ${(row + 1) * (100 / rows)}%
      )`

      const delay = Math.random() * maxDelay
      return {
        clipPath,
        delay,
      }
    })
  })

  onMount(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true))
    })
  })

  createEffect(() => {
    const colorTimeout = setTimeout(() => {
      setShowColor(true)
    }, merged.colorRevealDelay)
    onCleanup(() => clearTimeout(colorTimeout))
  })

  return (
    <div class="
      relative size-72 select-none
      md:size-96
    "
    >
      <For each={pieces()}>
        {(piece, index) => (
          <div
            class={cn(
              'absolute inset-0 transition-all ease-out',
              isVisible() ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              'clip-path': piece.clipPath,
              'transition-delay': `${piece.delay}ms`,
              'transition-duration': `${merged.pixelFadeInDuration}ms`,
            }}
          >
            <img
              src={merged.src}
              alt={`Pixel image piece ${index() + 1}`}
              class={cn(
                'z-1 rounded-[2.5rem] object-cover',
                merged.grayscaleAnimation
                  ? (showColor() ? 'grayscale-0' : 'grayscale')
                  : undefined,
              )}
              style={{
                transition: merged.grayscaleAnimation
                  ? `filter ${merged.pixelFadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  : 'none',
              }}
              draggable={false}
            />
          </div>
        )}
      </For>
    </div>
  )
}
