import type { JSX } from '@solidjs/web'
import { createEffect, createSignal, For } from 'solid-js'

import { cn } from '@/lib/utils'

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  class?: string
}

type MeteorStyle = JSX.CSSProperties & { '--angle': string }

export function Meteors(props: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = createSignal<MeteorStyle[]>([])

  const angle = () => props.angle ?? 215
  const maxDelay = () => props.maxDelay ?? 1.2
  const maxDuration = () => props.maxDuration ?? 10
  const minDelay = () => props.minDelay ?? 0.2
  const minDuration = () => props.minDuration ?? 2
  const number = () => props.number ?? 20

  createEffect(
    () => ({
      number: number(),
      angle: angle(),
      maxDelay: maxDelay(),
      minDelay: minDelay(),
      maxDuration: maxDuration(),
      minDuration: minDuration(),
    }),
    ({ number, angle, maxDelay, minDelay, maxDuration, minDuration }) => {
      const styles = Array.from({ length: number }).map<MeteorStyle>(() => ({
        '--angle': `${-angle}deg`,
        'top': '-5%',
        'left': `calc(0% + ${Math.floor(Math.random() * window.innerWidth)}px)`,
        'animation-delay': `${Math.random() * (maxDelay - minDelay) + minDelay}s`,
        'animation-duration': `${Math.floor(Math.random() * (maxDuration - minDuration) + minDuration)}s`,
      }))

      setMeteorStyles(styles)
    },
  )

  return (
    <>
      <For each={meteorStyles()}>
        {style => (
          // Meteor Head
          <span
            style={style}
            class={cn(
              `
                pointer-events-none absolute size-0.5 rotate-(--angle)
                animate-meteor rounded-full bg-zinc-500
                shadow-[0_0_0_1px_#ffffff10]
              `,
              props.class,
            )}
          >
            {/* Meteor Tail */}
            <div class="
              pointer-events-none absolute top-1/2 -z-10 h-px w-12.5
              -translate-y-1/2 bg-linear-to-r from-zinc-500 to-transparent
            "
            />
          </span>
        )}
      </For>
    </>
  )
}
