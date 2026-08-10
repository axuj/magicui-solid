import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export interface ShineBorderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[]
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 */
export function ShineBorder(props: ShineBorderProps) {
  const [local, rest] = splitProps(props, [
    'borderWidth',
    'duration',
    'shineColor',
    'class',
    'style',
  ])

  const backgroundImage = () => {
    const shineColor = local.shineColor ?? '#000000'
    return `radial-gradient(transparent,transparent, ${Array.isArray(shineColor) ? shineColor.join(',') : shineColor},transparent,transparent)`
  }

  return (
    <div
      style={{
        '--border-width': `${local.borderWidth ?? 1}px`,
        '--duration': `${local.duration ?? 14}s`,
        'background-image': backgroundImage(),
        'background-size': '300% 300%',
        'mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        '-webkit-mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        '-webkit-mask-composite': 'xor',
        'mask-composite': 'exclude',
        'padding': 'var(--border-width)',
        ...(local.style as JSX.CSSProperties | undefined),
      }}
      class={cn(
        `
          pointer-events-none absolute inset-0 size-full rounded-[inherit]
          will-change-[background-position]
          motion-safe:animate-shine
        `,
        local.class,
      )}
      {...rest}
    />
  )
}
