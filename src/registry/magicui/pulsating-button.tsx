import type { JSX } from '@solidjs/web'
import { createEffect, omit } from 'solid-js'

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
  const rest = omit(props, 'class', 'children', 'pulseColor', 'duration', 'distance', 'variant', 'ref')
  const distance = () => props.distance ?? '8px'
  const duration = () => props.duration ?? '1.5s'
  const variant = () => props.variant ?? 'pulse' as const

  let innerRef: HTMLButtonElement | undefined

  createEffect(
    () => ({ ref: props.ref, pulseColor: props.pulseColor }),
    ({ ref, pulseColor }) => {
      if (!innerRef)
        return
      ref?.(innerRef)

      if (pulseColor) {
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

      return () => {
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId)
        }

        themeObserver.disconnect()
        buttonObserver.disconnect()

        for (const eventName of syncEvents) {
          innerRef.removeEventListener(eventName, scheduleBgUpdate)
        }
      }
    },
  )

  return (
    <button
      ref={innerRef}
      class={cn(
        `
          relative flex cursor-pointer items-center justify-center rounded-lg
          bg-primary px-4 py-2 text-center text-primary-foreground
        `,
        props.class,
      )}
      style={{
        ...(props.pulseColor && { '--pulse-color': props.pulseColor }),
        '--duration': duration(),
        '--distance': distance(),
      } as JSX.CSSProperties}
      {...rest}
    >
      <span class="relative z-10">{props.children}</span>
      <span
        aria-hidden="true"
        class={cn(
          'pointer-events-none absolute inset-0 rounded-[inherit] bg-inherit',
          variant() === 'pulse' ? 'animate-pulse' : 'animate-pulse-ripple',
        )}
      />
    </button>
  )
}
