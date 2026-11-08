import type { ComponentProps } from 'solid-js'
import { createEffect, mergeProps, onCleanup, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

export interface Floating3DParticlesProps extends Omit<ComponentProps<'canvas'>, 'width' | 'height' | 'color'> {
  /**
   * Number of particles rendered on desktop viewports.
   * On mobile screens (< 768px), particle count automatically scales down
   * to 20 % to preserve smooth frame rates.
   * @default 400
   */
  quantity?: number
  /**
   * Particle color — 3 or 6 digit hex string.
   * @default "#8B5CF6"
   */
  color?: string
  /**
   * Mean particle radius in px. Each particle is randomly assigned a size
   * within ±40 % of this value.
   * @default 5
   */
  size?: number
  /**
   * Mean particle opacity (0–1). Each particle randomly varies within
   * ±0.2 of this value, clamped to [0, 1].
   * @default 0.3
   */
  opacity?: number
  /**
   * Vertical floating speed in px per frame. Positive values drift upward,
   * negative values downward.
   * @default 0.8
   */
  drift?: number
  /**
   * 3-D depth intensity on a 0–1 scale. `0` produces a flat 2D plane; `1`
   * creates strong perspective with pronounced near/far scaling.
   * @default 0.5
   */
  depth?: number
}

// ---------------------------------------------------------------------------
// Particle State (Polar coordinates + 3D perspective projection)
// ---------------------------------------------------------------------------

interface Particle {
  angle: number
  radius: number
  y: number
  size: number
  angularSpeed: number
  opacity: number
  screenX: number
  screenY: number
  projectedScale: number
}

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const MOBILE_BREAKPOINT = 768
const SPREAD_FACTOR = 1.2
const MAX_DPR = 2

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '').trim()
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean

  if (!/^[\da-f]{6}$/i.test(full))
    return `rgba(139,92,246,${alpha})`

  const n = Number.parseInt(full, 16)
  return `rgba(${(n >> 16) & 0xFF},${(n >> 8) & 0xFF},${n & 0xFF},${alpha})`
}

function deriveProjection(depth: number) {
  const t = Math.max(0, Math.min(1, depth))
  const fov = 800 - t * 600 // [800, 200]
  const perspectiveDistance = 100 + t * 700 // [100, 800]
  // depthRange stays below fov + pd - 1 to ensure positive denominator
  const depthRange = t * Math.min(400, fov + perspectiveDistance - 1)
  return { fov, perspectiveDistance, depthRange }
}

function spawnParticle(
  width: number,
  height: number,
  size: number,
  opacity: number,
): Particle {
  const sizeVariance = size * 0.4
  const opacityVariance = 0.2
  return {
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * Math.max(width, height) * SPREAD_FACTOR,
    y: (Math.random() - 0.5) * height * 2,
    size: Math.max(0.5, size - sizeVariance + Math.random() * sizeVariance * 2),
    angularSpeed: 0.0015 + Math.random() * 0.001,
    opacity: Math.min(
      1,
      Math.max(
        0,
        opacity - opacityVariance + Math.random() * opacityVariance * 2,
      ),
    ),
    screenX: 0,
    screenY: 0,
    projectedScale: 1,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Floating3DParticles(props: Floating3DParticlesProps) {
  const merged = mergeProps({
    quantity: 400,
    color: '#8B5CF6',
    size: 5,
    opacity: 0.3,
    drift: 0.8,
    depth: 0.5,
  }, props)
  const [local, rest] = splitProps(merged, [
    'class',
    'style',
    'quantity',
    'color',
    'size',
    'opacity',
    'drift',
    'depth',
  ])

  let canvasEl: HTMLCanvasElement | undefined

  createEffect(() => {
    const canvas = canvasEl
    if (!canvas)
      return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx)
      return

    // Read once per effect run so a changed option rebuilds the field, matching
    // the React source's dependency list. Color stays reactive: it is read in
    // the frame callback, so recolouring never tears down the field.
    const quantity = local.quantity
    const size = local.size
    const opacity = local.opacity
    const drift = local.drift
    const depth = local.depth

    let mounted = true
    let paused = false
    let reducedMotion = false
    let rafId: number | null = null

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let staticDirty = true

    const { fov, perspectiveDistance, depthRange } = deriveProjection(depth)

    // Reduced-motion media query (built-in a11y best practice)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReducedMotion = () => {
      reducedMotion = mq.matches
    }
    syncReducedMotion()

    // Draw single particle
    const draw = (p: Particle) => {
      const r = Math.max(0, p.size * p.projectedScale)
      if (r <= 0)
        return

      ctx.beginPath()
      ctx.fillStyle = hexToRgba(local.color, p.opacity)
      ctx.arc(p.screenX, p.screenY, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Static frame for reduced motion
    const staticFrame = () => {
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2

      for (const p of particles) {
        const denom = Math.max(1, fov + perspectiveDistance)
        const scale = fov / denom
        p.screenX = cx + Math.cos(p.angle) * p.radius * scale
        p.screenY = cy + p.y * scale
        p.projectedScale = scale
        draw(p)
      }
    }

    // Animation loop: continuous 3D field rotation and buoyant drift
    const tick = () => {
      if (!mounted)
        return

      if (paused) {
        rafId = requestAnimationFrame(tick)
        return
      }

      // Reduced motion: paint one static frame, then idle until something
      // invalidates it (resize, or the motion preference being turned off).
      if (reducedMotion) {
        if (staticDirty) {
          staticDirty = false
          staticFrame()
        }
        rafId = requestAnimationFrame(tick)
        return
      }

      staticDirty = true

      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2

      for (const p of particles) {
        // Continuous organic rotation around the 3D central axis
        p.angle += p.angularSpeed
        p.y -= drift

        // Respawn on the opposite edge, whichever one the particle left
        // through, so a negative drift falls instead of draining the field
        if (p.y < -height) {
          p.y = height
          p.radius = Math.random() * Math.max(width, height) * SPREAD_FACTOR
        }
        else if (p.y > height) {
          p.y = -height
          p.radius = Math.random() * Math.max(width, height) * SPREAD_FACTOR
        }

        // 3D Perspective Projection
        const denom = Math.max(
          1,
          fov + perspectiveDistance + Math.sin(p.angle) * depthRange,
        )
        const scale = fov / denom

        p.screenX = cx + Math.cos(p.angle) * p.radius * scale
        p.screenY = cy + p.y * scale
        p.projectedScale = scale
      }

      // Painter's algorithm: draw farthest particles first
      particles.sort((a, b) => a.projectedScale - b.projectedScale)
      for (const p of particles)
        draw(p)

      rafId = requestAnimationFrame(tick)
    }

    // Resize handling with automatic mobile count scaling
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))

      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, MAX_DPR))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const isMobile = window.innerWidth < MOBILE_BREAKPOINT
      const count = isMobile ? Math.round(quantity * 0.2) : quantity

      particles = Array.from({ length: Math.max(0, count) }, () =>
        spawnParticle(width, height, size, opacity))

      // Canvas was cleared by the width/height reassignment above.
      staticDirty = true
    }

    const onVisibilityChange = () => {
      paused = document.hidden
    }

    // ResizeObserver
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    if (ro) {
      ro.observe(canvas)
    }
    else {
      window.addEventListener('resize', resize)
    }

    // IntersectionObserver (built-in performance pause off-screen)
    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry)
            paused = document.hidden || !entry.isIntersecting
        },
        { threshold: 0 },
      )
      io.observe(canvas)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    mq.addEventListener('change', syncReducedMotion)

    resize()
    rafId = requestAnimationFrame(tick)

    onCleanup(() => {
      mounted = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      ro?.disconnect()
      if (!ro)
        window.removeEventListener('resize', resize)
      io?.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      mq.removeEventListener('change', syncReducedMotion)
    })
  })

  return (
    <canvas
      ref={canvasEl}
      aria-hidden="true"
      class={cn(
        'pointer-events-none absolute inset-0 size-full',
        local.class,
      )}
      style={local.style}
      {...rest}
    />
  )
}
