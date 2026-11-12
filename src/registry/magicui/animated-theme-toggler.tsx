import type { JSX } from '@solidjs/web'
import { Moon, Sun } from '@lucide/solid'
import { createEffect, createMemo, createSignal, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

export type TransitionVariant
  = 'circle'
    | 'square'
    | 'triangle'
    | 'diamond'
    | 'hexagon'
    | 'rectangle'
    | 'star'

interface AnimatedThemeTogglerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number
  variant?: TransitionVariant
  /** When true, the transition expands from the viewport center instead of the button center. */
  fromCenter?: boolean
  /**
   * Controlled theme value. When provided, the parent owns persistence
   * and this component will not write to localStorage.
   */
  theme?: 'light' | 'dark'
  /** Called on toggle. Pair with `theme` for controlled usage. */
  onThemeChange?: (theme: 'light' | 'dark') => void
}

function polygonCollapsed(point: string, vertexCount: number): string {
  const pairs = Array.from({ length: vertexCount }).fill(point).join(', ')
  return `polygon(${pairs})`
}

// All coordinates are percentages of the snapshot reference box: Chrome 150
// renders absolute px clip-path coordinates on ::view-transition-new(root)
// unscaled on fractional display scales (e.g. Windows 150%) for the first
// transition after load, so px values land at the wrong position (#989).
function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number,
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`
  // circle() percentage radii resolve against hypot(w, h) / sqrt(2) of the reference box.
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`

  switch (variant) {
    case 'circle':
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ]
    case 'square': {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const halfSide = Math.max(halfW, halfH) * 1.05
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case 'triangle': {
      const scale = maxRadius * 2.2
      const dx = (Math.sqrt(3) / 2) * scale
      const verts = [
        point(cx, cy - scale),
        point(cx + dx, cy + 0.5 * scale),
        point(cx - dx, cy + 0.5 * scale),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy), 3), `polygon(${verts})`]
    }
    case 'diamond': {
      // Slightly larger than the view-transition circle radius so axis-aligned coverage matches the circle reveal.
      const R = maxRadius * Math.SQRT2
      const end = [
        point(cx, cy - R),
        point(cx + R, cy),
        point(cx, cy + R),
        point(cx - R, cy),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case 'hexagon': {
      const R = maxRadius * Math.SQRT2
      const verts: string[] = []
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a)))
      }
      return [
        polygonCollapsed(point(cx, cy), 6),
        `polygon(${verts.join(', ')})`,
      ]
    }
    case 'rectangle': {
      const halfW = Math.max(cx, viewportWidth - cx)
      const halfH = Math.max(cy, viewportHeight - cy)
      const end = [
        point(cx - halfW, cy - halfH),
        point(cx + halfW, cy - halfH),
        point(cx + halfW, cy + halfH),
        point(cx - halfW, cy + halfH),
      ].join(', ')
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`]
    }
    case 'star': {
      // Small overscan so the last frames never leave a 1px seam before the transition group ends.
      const R = maxRadius * Math.SQRT2 * 1.03
      const innerRatio = 0.42
      const starPolygon = (radius: number) => {
        const verts: string[] = []
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          verts.push(
            point(
              cx + radius * Math.cos(outerA),
              cy + radius * Math.sin(outerA),
            ),
          )
          const innerA = outerA + Math.PI / 5
          verts.push(
            point(
              cx + radius * innerRatio * Math.cos(innerA),
              cy + radius * innerRatio * Math.sin(innerA),
            ),
          )
        }
        return `polygon(${verts.join(', ')})`
      }
      const startR = Math.max(2, R * 0.025)
      return [starPolygon(startR), starPolygon(R)]
    }
    default:
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ]
  }
}

export function AnimatedThemeToggler(props: AnimatedThemeTogglerProps) {
  const rest = omit(props, 'class', 'duration', 'variant', 'fromCenter', 'theme', 'onThemeChange')

  const isControlled = () => props.theme !== undefined
  const [internalIsDark, setInternalIsDark] = createSignal(false)
  const isDark = createMemo(() => (isControlled() ? props.theme === 'dark' : internalIsDark()))

  let buttonRef: HTMLButtonElement | undefined
  let isTransitioning = false
  let activeAnim: Animation | null = null

  const cancelAnim = () => {
    activeAnim?.cancel()
    activeAnim = null
  }

  onSettled(() => {
    return () => {
      cancelAnim()
      const root = document.documentElement
      if (root.dataset.magicuiThemeVt !== 'active')
        return
      delete root.dataset.magicuiThemeVt
      root.style.removeProperty('--magicui-theme-toggle-vt-duration')
      root.style.removeProperty('--magicui-theme-vt-clip-from')
    }
  })

  // Uncontrolled mode follows <html data-theme>; the caller owns the
  // controlled mode. createEffect also runs during SSR, so guard `document`.
  createEffect(
    () => (typeof document === 'undefined' || isControlled() ? null : document.documentElement),
    (root) => {
      if (!root)
        return

      const updateTheme = () => {
        setInternalIsDark(root.dataset.theme === 'dark')
      }

      updateTheme()

      const observer = new MutationObserver(updateTheme)
      observer.observe(root, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })

      return () => observer.disconnect()
    },
  )

  const toggleTheme = () => {
    const button = buttonRef
    if (
      !button
      || isTransitioning
      || document.documentElement.dataset.magicuiThemeVt === 'active'
    ) {
      return
    }

    const theme = isDark()
    const controlled = isControlled()
    const variant = props.variant ?? 'circle'
    const duration = props.duration ?? 400
    const onThemeChange = props.onThemeChange

    // innerWidth/innerHeight (not visualViewport): percentages must resolve
    // against the snapshot reference box, which includes classic scrollbars.
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x: number
    let y: number
    if (props.fromCenter ?? false) {
      x = viewportWidth / 2
      y = viewportHeight / 2
    }
    else {
      const { top, left, width, height } = button.getBoundingClientRect()
      x = left + width / 2
      y = top + height / 2
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    )

    const applyTheme = () => {
      const newTheme = !theme
      // Always toggle the attribute synchronously so the View Transitions API
      // snapshots the new theme inside the startViewTransition callback.
      document.documentElement.dataset.theme = newTheme ? 'dark' : 'light'
      if (controlled) {
        onThemeChange?.(newTheme ? 'dark' : 'light')
      }
      else {
        setInternalIsDark(newTheme)
        localStorage.setItem('starlight-theme', newTheme ? 'dark' : 'light')
      }
    }

    if (typeof document.startViewTransition !== 'function') {
      applyTheme()
      return
    }

    const clipPath = getThemeTransitionClipPaths(
      variant,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight,
    )

    const root = document.documentElement
    root.dataset.magicuiThemeVt = 'active'
    root.style.setProperty(
      '--magicui-theme-toggle-vt-duration',
      `${duration}ms`,
    )
    // Pin the collapsed clip-path via CSS so Firefox does not paint the new
    // theme unclipped between snapshot and the ready.then() JS animation.
    root.style.setProperty('--magicui-theme-vt-clip-from', clipPath[0])
    const cleanup = () => {
      isTransitioning = false
      delete root.dataset.magicuiThemeVt
      root.style.removeProperty('--magicui-theme-toggle-vt-duration')
      root.style.removeProperty('--magicui-theme-vt-clip-from')
      cancelAnim()
    }

    isTransitioning = true
    const transition = document.startViewTransition(() => {
      applyTheme()
    })
    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup).catch(() => {})
    }
    else {
      cleanup()
    }

    const ready = transition?.ready
    if (ready && typeof ready.then === 'function') {
      ready
        .then(() => {
          activeAnim = document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration,
              // Star: linear avoids easing overshoot that fights polygon interpolation at t→1; VT group duration is synced above.
              easing: variant === 'star' ? 'linear' : 'ease-in-out',
              fill: 'forwards',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
        .catch(() => {})
    }
  }

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      class={cn(props.class)}
      {...rest}
    >
      {isDark() ? <Sun /> : <Moon />}
      <span class="sr-only">Toggle theme</span>
    </button>
  )
}
