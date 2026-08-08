import type { JSX } from 'solid-js'
import { createEffect, mergeProps, onCleanup, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

interface PulsatingButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  class?: string
  children?: JSX.Element
  pulseColor?: string
  duration?: string
  distance?: string
  variant?: 'pulse' | 'ripple'
  ref?: (el: HTMLButtonElement) => void
}

export function PulsatingButton(props: PulsatingButtonProps) {
  const merged = mergeProps(
    {
      duration: '1.5s',
      distance: '8px',
      variant: 'pulse' as const,
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'class',
    'children',
    'pulseColor',
    'duration',
    'distance',
    'variant',
    'ref',
  ])

  let innerRef: HTMLButtonElement | undefined

  createEffect(() => {
    if (!innerRef)
      return
    local.ref?.(innerRef)

    if (local.pulseColor) {
      innerRef.style.removeProperty('--bg')
      return
    }

    let animationFrameId = 0
    let currentBg = ''

    const updateBg = () => {
      animationFrameId = 0

      const nextBg = getComputedStyle(innerRef).backgroundColor
      if (nextBg === currentBg)
        return

      currentBg = nextBg
      innerRef.style.setProperty('--bg', nextBg)
    }

    const scheduleBgUpdate = () => {
      if (animationFrameId)
        return
      animationFrameId = window.requestAnimationFrame(updateBg)
    }

    updateBg()

    const themeObserver = new MutationObserver(scheduleBgUpdate)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    const buttonObserver = new MutationObserver(scheduleBgUpdate)
    buttonObserver.observe(innerRef, {
      attributes: true,
    })

    const syncEvents = [
      'blur',
      'focus',
      'pointerenter',
      'pointerleave',
    ] as const

    for (const eventName of syncEvents) {
      innerRef.addEventListener(eventName, scheduleBgUpdate)
    }

    onCleanup(() => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }

      themeObserver.disconnect()
      buttonObserver.disconnect()

      for (const eventName of syncEvents) {
        innerRef.removeEventListener(eventName, scheduleBgUpdate)
      }
    })
  })

  return (
    <button
      ref={innerRef}
      class={cn(
        `
          relative flex cursor-pointer items-center justify-center rounded-lg
          bg-primary px-4 py-2 text-center text-primary-foreground
        `,
        local.class,
      )}
      style={{
        ...(local.pulseColor && { '--pulse-color': local.pulseColor }),
        '--duration': local.duration,
        '--distance': local.distance,
      } as JSX.CSSProperties}
      {...rest}
    >
      <span class="relative z-10">{local.children}</span>
      <span
        aria-hidden="true"
        class={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] bg-inherit',
          local.variant === 'pulse' ? 'animate-pulse' : 'animate-pulse-ripple',
        )}
      />
    </button>
  )
}
