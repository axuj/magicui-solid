import type { JSX, ValidComponent } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'

import { createEffect, createMemo, createSignal, For, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

type CharacterSet = string[] | readonly string[]

interface HyperTextProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * The text content to be animated
   */
  children: string
  /**
   * Optional class for styling
   */
  class?: string
  /**
   * Duration of the animation in milliseconds
   */
  duration?: number
  /**
   * Delay before animation starts in milliseconds
   */
  delay?: number
  /**
   * Component to render as - defaults to div
   */
  as?: ValidComponent
  /**
   * Whether to start animation when element comes into view
   */
  startOnView?: boolean
  /**
   * Whether to trigger animation on hover
   */
  animateOnHover?: boolean
  /**
   * Custom character set for scramble effect. Defaults to uppercase alphabet
   */
  characterSet?: CharacterSet
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
) as readonly string[]

const getRandomInt = (max: number): number => Math.floor(Math.random() * max)

export function HyperText(props: HyperTextProps) {
  const rest = omit(props, 'children', 'class', 'duration', 'delay', 'as', 'startOnView', 'animateOnHover', 'characterSet')
  const animateOnHover = () => props.animateOnHover ?? true
  const characterSet = () => props.characterSet ?? DEFAULT_CHARACTER_SET
  const duration = () => props.duration ?? 800
  const startOnView = () => props.startOnView ?? false

  // Animation progress 0→1; 1 means idle/completed. Everything else is derived.
  const [progress, setProgress] = createSignal(1)
  let animationFrameId: number | null = null
  let elementRef: HTMLElement | undefined

  // Derived display text: reacts to children changes automatically and
  // re-randomizes scramble chars on every progress tick (same as the previous
  // per-frame map over the signal).
  const displayText = createMemo(() => {
    const chars = props.children.split('')
    const currentIter = progress() * chars.length
    return chars.map((char, index) =>
      char === ' '
        ? char
        : index <= currentIter
          ? char
          : characterSet()[getRandomInt(characterSet().length)],
    )
  })

  const startAnimation = () => {
    if (animationFrameId !== null)
      return
    const startTime = performance.now()
    const tick = (currentTime: number) => {
      const next = Math.min((currentTime - startTime) / duration(), 1)
      setProgress(next)
      animationFrameId = next < 1 ? requestAnimationFrame(tick) : null
    }
    animationFrameId = requestAnimationFrame(tick)
  }

  const handleAnimationTrigger = () => {
    if (animateOnHover() && progress() === 1)
      startAnimation()
  }

  // Handle animation start based on view or delay
  createEffect(
    () => ({ startOnView: startOnView(), delay: props.delay }),
    ({ startOnView, delay }) => {
      if (!startOnView) {
        const startTimeout = setTimeout(startAnimation, (delay ?? 0))
        return () => clearTimeout(startTimeout)
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              startAnimation()
            }, (props.delay ?? 0))
            observer.disconnect()
          }
        },
        { threshold: 0.1, rootMargin: '-30% 0px -30% 0px' },
      )

      if (elementRef)
        observer.observe(elementRef)

      return () => observer.disconnect()
    },
  )

  onSettled(() => {
    return () => {
      if (animationFrameId !== null)
        cancelAnimationFrame(animationFrameId)
    }
  })

  return (
    <Dynamic
      component={(props.as ?? 'div')}
      ref={elementRef}
      class={cn('overflow-hidden py-2 text-4xl font-bold', props.class)}
      onMouseEnter={handleAnimationTrigger}
      {...rest}
    >
      <For each={displayText()}>
        {letter => (
          <span class={cn('font-mono', letter === ' ' ? 'w-3' : '')}>
            {letter.toUpperCase()}
          </span>
        )}
      </For>
    </Dynamic>
  )
}
