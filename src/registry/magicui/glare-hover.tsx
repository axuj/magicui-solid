import type { JSX } from '@solidjs/web'
import { createMemo, omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface GlareHoverProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional CSS width on the root element (e.g. `"100%"`, `"320px"`).
   */
  width?: string
  /**
   * Optional CSS height on the root element (e.g. `"auto"`, `"200px"`).
   */
  height?: string
  /**
   * Background color of the wrapper (CSS color string).
   */
  background?: string
  /**
   * Glare highlight as `#rrggbb` or `#rgb`; parsed to `rgba` for the gradient.
   */
  color?: Color
  /**
   * Opacity applied to the glare color when converting hex to `rgba` (0–1).
   */
  opacity?: number
  /**
   * Gradient angle in degrees (`--gh-angle`).
   */
  angle?: number
  /**
   * Glare tile size as a percentage of the element (`--gh-size`, `background-size`).
   */
  size?: number
  /**
   * Transition duration for the glare sweep in milliseconds (`--gh-duration`).
   */
  duration?: number
  /**
   * When `true`, the glare transition only runs on hover (no animation until pointer enters).
   */
  playOnce?: boolean
}

type Color = `#${string}`
type RGBA = `rgba(${number},${number},${number},${number})`

function parseHEX(color: Color, opacity: number): RGBA | Color {
  const hex = color.replace('#', '')
  const parse = (h: string) => Number.parseInt(h, 16)
  if (/^[0-9A-F]{6}$/i.test(hex)) {
    return `rgba(${parse(hex.slice(0, 2))},${parse(hex.slice(2, 4))},${parse(hex.slice(4, 6))},${opacity})`
  }
  if (/^[0-9A-F]{3}$/i.test(hex)) {
    return `rgba(${parse(hex[0] + hex[0])},${parse(hex[1] + hex[1])},${parse(hex[2] + hex[2])},${opacity})`
  }

  return color
}

export function GlareHover(props: GlareHoverProps) {
  const rest = omit(props, 'background', 'color', 'opacity', 'angle', 'size', 'duration', 'playOnce', 'width', 'height', 'class', 'style')

  const rgba = createMemo(() => {
    const color = props.color ?? '#ffffff'
    const opacity = props.opacity ?? 0.5
    return parseHEX(color, opacity)
  })

  return (
    <div
      {...rest}
      class={cn(
        `
          relative grid size-fit cursor-pointer place-items-center
          overflow-hidden bg-transparent
        `,
        // BEFORE ELEMENT
        `
          before:pointer-events-none before:absolute before:inset-0 before:z-10
          before:bg-no-repeat before:content-[\'\']
        `,
        // GRADIENT
        `
          before:bg-[linear-gradient(var(--gh-angle),transparent_60%,var(--gh-rgba)_70%,transparent,transparent_100%)]
        `,
        // SIZE + POSITION
        'before:bg-size-[var(--gh-size)_var(--gh-size),100%_100%]',
        'before:bg-position-[-100%_-100%,0_0]',
        // TRANSITION
        !props.playOnce
        && `
          before:transition-[background-position]
          before:duration-(--gh-duration) before:ease-in-out
        `,
        props.playOnce
        && `
          before:transition-none
          hover:before:transition-[background-position]
          hover:before:duration-(--gh-duration)
        `,
        // HOVER EFFECT
        'hover:before:bg-position-[100%_100%,0_0]',
        props.class,
      )}
      style={{
        '--gh-angle': `${props.angle ?? -45}deg`,
        '--gh-duration': `${props.duration ?? 650}ms`,
        '--gh-size': `${props.size ?? 250}%`,
        '--gh-rgba': rgba(),
        'background': props.background ?? '#000',
        ...(props.style as JSX.CSSProperties | undefined),
        ...(props.width !== undefined ? { width: props.width } : {}),
        ...(props.height !== undefined ? { height: props.height } : {}),
      }}
    >
      {props.children}
    </div>
  )
}
