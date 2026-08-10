import type { JSX, ValidComponent } from 'solid-js'
import { createEffect, createMemo, createSignal, For, mergeProps, onCleanup, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
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
  const merged = mergeProps(
    {
      duration: 800,
      delay: 0,
      as: 'div',
      startOnView: false,
      animateOnHover: true,
      characterSet: DEFAULT_CHARACTER_SET,
    } as const,
    props,
  )
  const [local, rest] = splitProps(merged, [
    'children',
    'class',
    'duration',
    'delay',
    'as',
    'startOnView',
    'animateOnHover',
    'characterSet',
  ])

  // Animation progress 0→1; 1 means idle/completed. Everything else is derived.
  const [progress, setProgress] = createSignal(1)
  let animationFrameId: number | null = null
  let elementRef: HTMLElement | undefined

  // Derived display text: reacts to children changes automatically and
  // re-randomizes scramble chars on every progress tick (same as the previous
  // per-frame map over the signal).
  const displayText = createMemo(() => {
    const chars = local.children.split('')
    const currentIter = progress() * chars.length
    return chars.map((char, index) =>
      char === ' '
        ? char
        : index <= currentIter
          ? char
          : local.characterSet[getRandomInt(local.characterSet.length)],
    )
  })

  const startAnimation = () => {
    if (animationFrameId !== null)
      return
    const startTime = performance.now()
    const tick = (currentTime: number) => {
      const next = Math.min((currentTime - startTime) / local.duration, 1)
      setProgress(next)
      animationFrameId = next < 1 ? requestAnimationFrame(tick) : null
    }
    animationFrameId = requestAnimationFrame(tick)
  }

  const handleAnimationTrigger = () => {
    if (local.animateOnHover && progress() === 1)
      startAnimation()
  }

  // Handle animation start based on view or delay
  createEffect(() => {
    if (!local.startOnView) {
      const startTimeout = setTimeout(startAnimation, local.delay)
      onCleanup(() => clearTimeout(startTimeout))
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            startAnimation()
          }, local.delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '-30% 0px -30% 0px' },
    )

    if (elementRef)
      observer.observe(elementRef)

    onCleanup(() => observer.disconnect())
  })

  onCleanup(() => {
    if (animationFrameId !== null)
      cancelAnimationFrame(animationFrameId)
  })

  return (
    <Dynamic
      component={local.as}
      ref={elementRef}
      class={cn('overflow-hidden py-2 text-4xl font-bold', local.class)}
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
