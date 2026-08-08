import type { ComponentProps, JSX } from 'solid-js'
import { createEffect, createSignal, For, mergeProps, onCleanup, splitProps } from 'solid-js'

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

export function RippleButton(props: RippleButtonProps) {
  const merged = mergeProps(
    {
      rippleColor: '#ffffff',
      duration: '600ms',
    },
    props,
  )
  const [local, rest] = splitProps(merged, ['class', 'children', 'rippleColor', 'duration', 'onClick'])
  const [buttonRipples, setButtonRipples] = createSignal<RippleButtonRipple[]>([])

  const createRipple = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const newRipple = { x, y, size, key: Date.now() }
    setButtonRipples(prevRipples => [...prevRipples, newRipple])
  }

  const handleClick = (event: MouseEvent) => {
    createRipple(event)
    local.onClick?.(event)
  }

  createEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null

    if (buttonRipples().length > 0) {
      const lastRipple = buttonRipples()[buttonRipples().length - 1]
      timeout = setTimeout(() => {
        setButtonRipples(prevRipples =>
          prevRipples.filter(ripple => ripple.key !== lastRipple.key),
        )
      }, Number.parseInt(local.duration))
    }

    onCleanup(() => {
      if (timeout !== null) {
        clearTimeout(timeout)
      }
    })
  })

  return (
    <button
      class={cn(
        `
          relative flex cursor-pointer items-center justify-center
          overflow-hidden rounded-lg border-2 bg-background px-4 py-2
          text-center text-primary
        `,
        local.class,
      )}
      onClick={handleClick}
      {...rest}
    >
      <div class="relative z-10">{local.children}</div>
      <span class="pointer-events-none absolute inset-0">
        <For each={buttonRipples()}>
          {ripple => (
            <span
              class="
                absolute animate-rippling rounded-full bg-background opacity-30
              "
              style={{
                'width': `${ripple.size}px`,
                'height': `${ripple.size}px`,
                'top': `${ripple.y}px`,
                'left': `${ripple.x}px`,
                'background-color': local.rippleColor,
                'transform': 'scale(0)',
                '--duration': local.duration,
              } as JSX.CSSProperties}
            />
          )}
        </For>
      </span>
    </button>
  )
}
