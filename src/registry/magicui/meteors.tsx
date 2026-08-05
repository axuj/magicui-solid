import type { JSX } from 'solid-js'
import { createEffect, createSignal, For, mergeProps } from 'solid-js'

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

  const merged = mergeProps(
    { number: 20, minDelay: 0.2, maxDelay: 1.2, minDuration: 2, maxDuration: 10, angle: 215 },
    props,
  )

  createEffect(() => {
    const styles = Array.from({ length: merged.number }).map<MeteorStyle>(() => ({
      '--angle': `${-merged.angle}deg`,
      'top': '-5%',
      'left': `calc(0% + ${Math.floor(Math.random() * window.innerWidth)}px)`,
      'animation-delay': `${Math.random() * (merged.maxDelay - merged.minDelay) + merged.minDelay}s`,
      'animation-duration': `${Math.floor(Math.random() * (merged.maxDuration - merged.minDuration) + merged.minDuration)}s`,
    }))

    setMeteorStyles(styles)
  })

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
