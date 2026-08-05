import type { Transition } from 'motion'
import type { JSX } from 'solid-js'
import { animate } from 'motion'
import { createEffect, mergeProps, onCleanup, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

export interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number
  /**
   * The duration of the border beam.
   */
  duration?: number
  /**
   * The delay of the border beam.
   */
  delay?: number
  /**
   * The color of the border beam from.
   */
  colorFrom?: string
  /**
   * The color of the border beam to.
   */
  colorTo?: string
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition
  /**
   * The class name of the border beam.
   */
  class?: string
  /**
   * The style of the border beam.
   */
  style?: JSX.CSSProperties
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number
  /**
   * The border width of the beam.
   */
  borderWidth?: number
}

export function BorderBeam(props: BorderBeamProps) {
  const merged = mergeProps(
    {
      size: 50,
      delay: 0,
      duration: 6,
      colorFrom: '#ffaa40',
      colorTo: '#9c40ff',
      reverse: false,
      initialOffset: 0,
      borderWidth: 1,
    },
    props,
  )
  const [local] = splitProps(merged, [
    'size',
    'duration',
    'delay',
    'colorFrom',
    'colorTo',
    'transition',
    'class',
    'style',
    'reverse',
    'initialOffset',
    'borderWidth',
  ])

  let beamRef: HTMLDivElement | undefined

  createEffect(() => {
    if (!beamRef)
      return
    const animation = animate(
      beamRef,
      {
        offsetDistance: local.reverse
          ? [`${100 - local.initialOffset}%`, `${-local.initialOffset}%`]
          : [`${local.initialOffset}%`, `${100 + local.initialOffset}%`],
      },
      {
        repeat: Infinity,
        ease: 'linear',
        duration: local.duration,
        delay: -local.delay,
        ...local.transition,
      },
    )
    onCleanup(() => animation.stop())
  })

  return (
    <div
      class="
        pointer-events-none absolute inset-0 rounded-[inherit]
        border-(length:--border-beam-width) border-transparent
        mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)]
        mask-intersect [mask-clip:padding-box,border-box]
      "
      style={{ '--border-beam-width': `${local.borderWidth}px` }}
    >
      <div
        ref={beamRef}
        class={cn(
          `
            absolute aspect-square bg-linear-to-l from-(--color-from)
            via-(--color-to) to-transparent
          `,
          local.class,
        )}
        style={{
          'width': `${local.size}px`,
          'offset-path': `rect(0 auto auto 0 round ${local.size}px)`,
          'offset-distance': `${local.initialOffset}%`,
          '--color-from': local.colorFrom,
          '--color-to': local.colorTo,
          ...(local.style as JSX.CSSProperties | undefined),
        }}
      />
    </div>
  )
}
