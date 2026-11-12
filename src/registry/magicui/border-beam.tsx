import type { JSX } from '@solidjs/web'
import type { Transition } from 'motion'

import { animate } from 'motion'
import { createEffect } from 'solid-js'

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
  const borderWidth = () => props.borderWidth ?? 1
  const colorFrom = () => props.colorFrom ?? '#ffaa40'
  const colorTo = () => props.colorTo ?? '#9c40ff'
  const initialOffset = () => props.initialOffset ?? 0
  const reverse = () => props.reverse ?? false
  const size = () => props.size ?? 50

  let beamRef: HTMLDivElement | undefined

  createEffect(() => [
    reverse(),
    initialOffset(),
    props.duration,
    props.delay,
    props.transition,
  ], ([reverse, initialOffset, duration, delay, transition]) => {
    if (!beamRef)
      return
    const animation = animate(
      beamRef,
      {
        offsetDistance: reverse
          ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
          : [`${initialOffset}%`, `${100 + initialOffset}%`],
      },
      {
        repeat: Infinity,
        ease: 'linear',
        duration: duration ?? 6,
        delay: -(delay ?? 0),
        ...transition,
      },
    )
    return () => animation.stop()
  })

  return (
    <div
      class="
        pointer-events-none absolute inset-0 rounded-[inherit]
        border-(length:--border-beam-width) border-transparent
        mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)]
        mask-intersect [mask-clip:padding-box,border-box]
      "
      style={{ '--border-beam-width': `${borderWidth()}px` }}
    >
      <div
        ref={beamRef}
        class={cn(
          `
            absolute aspect-square bg-linear-to-l from-(--color-from)
            via-(--color-to) to-transparent
          `,
          props.class,
        )}
        style={{
          'width': `${size()}px`,
          'offset-path': `rect(0 auto auto 0 round ${size()}px)`,
          'offset-distance': `${initialOffset()}%`,
          '--color-from': colorFrom(),
          '--color-to': colorTo(),
          ...(props.style as JSX.CSSProperties | undefined),
        }}
      />
    </div>
  )
}
