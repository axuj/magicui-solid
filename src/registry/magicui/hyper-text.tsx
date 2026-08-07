import type { JSX, ValidComponent } from 'solid-js'
import { createEffect, createSignal, For, mergeProps, onCleanup, splitProps, untrack } from 'solid-js'
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

  const [displayText, setDisplayText] = createSignal<string[]>(untrack(() => local.children.split('')))
  const [isAnimating, setIsAnimating] = createSignal(false)
  let iterationCount = 0
  let elementRef: HTMLElement | undefined

  const handleAnimationTrigger = () => {
    if (local.animateOnHover && !isAnimating()) {
      iterationCount = 0
      setIsAnimating(true)
    }
  }

  // Handle animation start based on view or delay
  createEffect(() => {
    if (!local.startOnView) {
      const startTimeout = setTimeout(() => {
        setIsAnimating(true)
      }, local.delay)
      onCleanup(() => clearTimeout(startTimeout))
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsAnimating(true)
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

  // Handle scramble animation
  createEffect(() => {
    if (!isAnimating())
      return

    const maxIterations = local.children.length
    const startTime = performance.now()
    const charset = local.characterSet
    let animationFrameId: number | null = null

    const animateScramble = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / local.duration, 1)

      iterationCount = progress * maxIterations

      setDisplayText(currentText =>
        currentText.map((letter, index) =>
          letter === ' '
            ? letter
            : (index <= iterationCount)
                ? local.children[index]
                : charset[getRandomInt(charset.length)],
        ),
      )

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateScramble)
      }
      else {
        setIsAnimating(false)
      }
    }

    animationFrameId = requestAnimationFrame(animateScramble)

    onCleanup(() => {
      if (animationFrameId !== null)
        cancelAnimationFrame(animationFrameId)
    })
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
