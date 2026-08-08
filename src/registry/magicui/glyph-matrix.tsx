import type { JSX } from 'solid-js'
import { createEffect, mergeProps, onCleanup, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

interface GlyphMatrixProps extends JSX.CanvasHTMLAttributes<HTMLCanvasElement> {
  /** Characters to randomly pick from */
  glyphs?: string
  /** Cell size in px (also font size) */
  cellSize?: number
  /** Probability (0-1) a cell mutates each tick */
  mutationRate?: number
  /** Tick interval in ms */
  interval?: number
  /** Fade out toward bottom (0 = no fade) */
  fadeBottom?: number
  /** Glyph color (any CSS color). Pass a theme-aware value from the consumer. */
  color?: string
}

/**
 * GlyphMatrix — an animated grid of subtly shifting glyphs.
 * Pass a `color` prop (e.g. driven by next-themes) to adapt it to
 * light and dark modes.
 */
export function GlyphMatrix(props: GlyphMatrixProps) {
  const merged = mergeProps(
    {
      glyphs: '01·•+*/\\<>=',
      cellSize: 14,
      mutationRate: 0.04,
      interval: 90,
      fadeBottom: 0.6,
      color: '#6B7280',
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'class',
    'glyphs',
    'cellSize',
    'mutationRate',
    'interval',
    'fadeBottom',
    'color',
    'style',
  ])

  let canvasEl: HTMLCanvasElement | undefined
  // Current glyph color as RGBA (a in 0-1). Kept in a plain object so a color
  // change (e.g. theme toggle) recolors the next frame without restarting the
  // animation. Defaults to #6B7280.
  const rgba = { r: 107, g: 114, b: 128, a: 1 }

  // Resolve the CSS color string to RGBA (handles hex, rgb, hsl, oklch, ...).
  createEffect(() => {
    const probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1
    const probeCtx = probe.getContext('2d')
    if (!probeCtx)
      return
    // Seed with the default so an invalid color falls back to it: the 2d
    // context keeps the previous fillStyle when assigned an invalid value
    // instead of silently turning black.
    probeCtx.fillStyle = '#6B7280'
    probeCtx.fillStyle = local.color
    probeCtx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data
    rgba.r = r
    rgba.g = g
    rgba.b = b
    rgba.a = a / 255
  })

  createEffect(() => {
    const canvas = canvasEl
    if (!canvas)
      return

    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    const cellSize = local.cellSize
    const glyphs = local.glyphs
    const mutationRate = local.mutationRate
    const interval = local.interval
    const fadeBottom = local.fadeBottom

    let cols = 0
    let rows = 0
    let cells: string[] = []
    let alphas: number[] = []
    let raf = 0
    let last = 0
    let stopped = false

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { clientWidth: w, clientHeight: h } = canvas

      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.ceil(w / cellSize)
      rows = Math.ceil(h / cellSize)

      cells = Array.from({ length: cols * rows }, () => glyphs[Math.floor(Math.random() * glyphs.length)])
      alphas = Array.from({ length: cols * rows }, () => 0.05 + Math.random() * 0.35)
    }

    const draw = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      ctx.clearRect(0, 0, w, h)

      ctx.font = `${cellSize - 2}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textBaseline = 'top'

      const { r, g, b, a: colorAlpha } = rgba
      for (let y = 0; y < rows; y++) {
        const fade = fadeBottom > 0 ? 1 - (y / rows) * fadeBottom : 1
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x
          const a = alphas[i] * fade * colorAlpha
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
          ctx.fillText(cells[i], x * cellSize, y * cellSize)
        }
      }
    }

    const tick = (t: number) => {
      if (stopped)
        return

      if (t - last >= interval) {
        last = t

        const total = cols * rows
        const mutations = Math.max(1, Math.floor(total * mutationRate))

        for (let n = 0; n < mutations; n++) {
          const i = Math.floor(Math.random() * total)
          cells[i] = glyphs[Math.floor(Math.random() * glyphs.length)]
          alphas[i] = 0.05 + Math.random() * 0.45
        }

        draw()
      }

      raf = requestAnimationFrame(tick)
    }

    resize()
    draw()
    raf = requestAnimationFrame(tick)

    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(canvas)

    onCleanup(() => {
      stopped = true
      cancelAnimationFrame(raf)
      ro.disconnect()
    })
  })

  return (
    <canvas
      ref={canvasEl}
      class={cn('pointer-events-none', local.class)}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        ...(local.style as JSX.CSSProperties | undefined),
      }}
      aria-hidden="true"
      {...rest}
    />
  )
}
