import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { createEffect, createMemo, For, omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface LightRaysProps extends JSX.HTMLAttributes<HTMLDivElement> {
  count?: number
  color?: string
  blur?: number
  speed?: number
  length?: string
}

interface LightRay {
  id: string
  left: number
  rotate: number
  width: number
  swing: number
  delay: number
  duration: number
  intensity: number
}

function createRays(count: number, cycle: number): LightRay[] {
  if (count <= 0)
    return []

  return Array.from({ length: count }, (_, index) => {
    const left = 8 + Math.random() * 84
    const rotate = -28 + Math.random() * 56
    const width = 160 + Math.random() * 160
    const swing = 0.8 + Math.random() * 1.8
    const delay = Math.random() * cycle
    const duration = cycle * (0.75 + Math.random() * 0.5)
    const intensity = 0.6 + Math.random() * 0.5

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    }
  })
}

function Ray(props: LightRay) {
  let rayRef: HTMLDivElement | undefined

  createEffect(
    () => ({ intensity: props.intensity, rotate: props.rotate, swing: props.swing, duration: props.duration, delay: props.delay }),
    ({ intensity, rotate, swing, duration, delay }) => {
      if (!rayRef)
        return

      const controls = animate(
        rayRef,
        {
          opacity: [0, intensity, 0],
          rotate: [
            rotate - swing,
            rotate + swing,
            rotate - swing,
          ],
        },
        {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
          repeatDelay: duration * 0.1,
        },
      )

      return () => controls.stop()
    },
  )

  return (
    <div
      ref={rayRef}
      class={`
        pointer-events-none absolute top-[-12%] left-(--ray-left)
        h-(--light-rays-length) w-(--ray-width) origin-top -translate-x-1/2
        rotate-0 rounded-full bg-linear-to-b
        from-[color-mix(in_srgb,var(--light-rays-color)_70%,transparent)]
        to-transparent opacity-0 mix-blend-screen blur-(--light-rays-blur)
      `}
      style={{
        '--ray-left': `${props.left}%`,
        '--ray-width': `${props.width}px`,
      }}
    />
  )
}

export function LightRays(props: LightRaysProps) {
  const rest = omit(props, 'class', 'style', 'count', 'color', 'blur', 'speed', 'length')
  const blur = () => props.blur ?? 36
  const color = () => props.color ?? 'rgba(160, 210, 255, 0.2)'
  const count = () => props.count ?? 7
  const length = () => props.length ?? '70vh'
  const speed = () => props.speed ?? 14
  const cycleDuration = () => Math.max(speed(), 0.1)
  const rays = createMemo(() => createRays(count(), cycleDuration()))

  return (
    <div
      class={cn(
        `
          pointer-events-none absolute inset-0 isolate overflow-hidden
          rounded-[inherit]
        `,
        props.class,
      )}
      style={{
        '--light-rays-color': color(),
        '--light-rays-blur': `${blur()}px`,
        '--light-rays-length': length(),
        ...(props.style ?? {}) as JSX.CSSProperties,
      }}
      {...rest}
    >
      <div class="absolute inset-0 overflow-hidden">
        <div
          aria-hidden="true"
          class="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--light-rays-color) 45%, transparent), transparent 70%)',
          }}
        />
        <div
          aria-hidden="true"
          class="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--light-rays-color) 35%, transparent), transparent 75%)',
          }}
        />
        <For each={rays()}>{ray => <Ray {...ray} />}</For>
      </div>
    </div>
  )
}
