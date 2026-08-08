import type { JSX } from 'solid-js'
import { createEffect, createSignal, mergeProps, onCleanup, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

interface NeonColorsProps {
  firstColor: string
  secondColor: string
}

interface NeonGradientCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * @default ""
   * @type string
   * @description
   * The className of the card
   */
  className?: string

  /**
   * @default ""
   * @type JSX.Element
   * @description
   * The children of the card
   */
  children?: JSX.Element

  /**
   * @default 5
   * @type number
   * @description
   * The size of the border in pixels
   */
  borderSize?: number

  /**
   * @default 20
   * @type number
   * @description
   * The size of the radius in pixels
   */
  borderRadius?: number

  /**
   * @default "{ firstColor: '#ff00aa', secondColor: '#00FFF1' }"
   * @type string
   * @description
   * The colors of the neon gradient
   */
  neonColors?: NeonColorsProps
}

export function NeonGradientCard(props: NeonGradientCardProps) {
  const merged = mergeProps(
    {
      borderSize: 2,
      borderRadius: 20,
      neonColors: { firstColor: '#ff00aa', secondColor: '#00FFF1' },
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'className',
    'children',
    'borderSize',
    'borderRadius',
    'neonColors',
  ])

  let containerRef: HTMLDivElement | undefined
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 })

  createEffect(() => {
    const container = containerRef
    if (!container)
      return

    const updateDimensions = () => {
      const { offsetWidth, offsetHeight } = container
      setDimensions({ width: offsetWidth, height: offsetHeight })
    }

    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(container)
    window.addEventListener('resize', updateDimensions)
    onCleanup(() => {
      observer.disconnect()
      window.removeEventListener('resize', updateDimensions)
    })
  })

  return (
    <div
      ref={containerRef}
      style={{
        '--border-size': `${local.borderSize}px`,
        '--border-radius': `${local.borderRadius}px`,
        '--neon-first-color': local.neonColors.firstColor,
        '--neon-second-color': local.neonColors.secondColor,
        '--card-width': `${dimensions().width}px`,
        '--card-height': `${dimensions().height}px`,
        '--card-content-radius': `${local.borderRadius - local.borderSize}px`,
        '--pseudo-element-background-image': `linear-gradient(0deg, ${local.neonColors.firstColor}, ${local.neonColors.secondColor})`,
        '--pseudo-element-width': `${dimensions().width + local.borderSize * 2}px`,
        '--pseudo-element-height': `${dimensions().height + local.borderSize * 2}px`,
        '--after-blur': `${dimensions().width / 3}px`,
      }}
      class={cn(
        'relative z-10 size-full rounded-(--border-radius)',
        local.className,
      )}
      {...rest}
    >
      <div
        class={cn(
          `
            relative size-full min-h-[inherit] rounded-(--card-content-radius)
            bg-gray-100 p-6
          `,
          `
            before:absolute before:-top-(--border-size)
            before:-left-(--border-size) before:-z-10 before:block
          `,
          `
            before:h-(--pseudo-element-height) before:w-(--pseudo-element-width)
            before:rounded-(--border-radius) before:content-[\'\']
          `,
          `
            before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))]
            before:bg-size-[100%_200%]
          `,
          'before:animate-background-position-spin',
          `
            after:absolute after:-top-(--border-size)
            after:-left-(--border-size) after:-z-10 after:block
          `,
          `
            after:h-(--pseudo-element-height) after:w-(--pseudo-element-width)
            after:rounded-(--border-radius) after:blur-(--after-blur)
            after:content-[\'\']
          `,
          `
            after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))]
            after:bg-size-[100%_200%] after:opacity-80
          `,
          'after:animate-background-position-spin',
          'dark:bg-neutral-900',
          'wrap-break-word',
        )}
      >
        {local.children}
      </div>
    </div>
  )
}
