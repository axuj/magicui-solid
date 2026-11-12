import type { ComponentProps, JSX } from '@solidjs/web'
import { createEffect, createSignal, For, omit } from 'solid-js'

import { cn } from '@/lib/utils'

interface RippleButtonProps extends Omit<ComponentProps<'button'>, 'onClick'> {
  onClick?: (event: MouseEvent) => void
  rippleColor?: string
  duration?: string
}

interface RippleButtonRipple {
  x: number
  y: number
  size: number
  key: number
}

function ButtonRipple(props: {
  ripple: RippleButtonRipple
  rippleColor: string
  duration: string
  onDone: (key: number) => void
}) {
  createEffect(
    () => ({ key: props.ripple.key, duration: props.duration, onDone: props.onDone }),
    ({ key, duration, onDone }) => {
      const ms = Number.parseInt(duration)
      const timeout = setTimeout(onDone, ms, key)
      return () => clearTimeout(timeout)
    },
  )

  return (
    <span
      class="absolute animate-rippling rounded-full bg-background opacity-30"
      style={{
        'width': `${props.ripple.size}px`,
        'height': `${props.ripple.size}px`,
        'top': `${props.ripple.y}px`,
        'left': `${props.ripple.x}px`,
        'background-color': props.rippleColor,
        'transform': 'scale(0)',
        '--duration': props.duration,
      } as JSX.CSSProperties}
    />
  )
}

export function RippleButton(props: RippleButtonProps) {
  const rest = omit(props, 'class', 'children', 'rippleColor', 'duration', 'onClick')
  const [buttonRipples, setButtonRipples] = createSignal<RippleButtonRipple[]>([])
  let nextKey = 0

  const removeRipple = (key: number) => {
    setButtonRipples(prevRipples => prevRipples.filter(ripple => ripple.key !== key))
  }

  const createRipple = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    nextKey += 1
    const newRipple = { x, y, size, key: nextKey }
    setButtonRipples(prevRipples => [...prevRipples, newRipple])
  }

  const handleClick = (event: MouseEvent) => {
    createRipple(event)
    props.onClick?.(event)
  }

  return (
    <button
      class={cn(
        `
          relative flex cursor-pointer items-center justify-center
          overflow-hidden rounded-lg border-2 bg-background px-4 py-2
          text-center text-primary
        `,
        props.class,
      )}
      onClick={handleClick}
      {...rest}
    >
      <div class="relative z-10">{props.children}</div>
      <span class="pointer-events-none absolute inset-0">
        <For each={buttonRipples()}>
          {ripple => (
            <ButtonRipple
              ripple={ripple}
              rippleColor={(props.rippleColor ?? '#ffffff')}
              duration={(props.duration ?? '600ms')}
              onDone={removeRipple}
            />
          )}
        </For>
      </span>
    </button>
  )
}
