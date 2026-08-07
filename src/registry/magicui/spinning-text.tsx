import type { TargetAndTransition, Transition, Variant, Variants } from 'motion'
import type { JSX } from 'solid-js'
import { animate } from 'motion'
import { For, mergeProps, onCleanup, onMount, untrack } from 'solid-js'
import { cn } from '@/lib/utils'

interface SpinningTextProps {
  children: string | string[]
  duration?: number
  reverse?: boolean
  radius?: number
  transition?: Transition
  variants?: {
    container?: Variants
    item?: Variants
  }
  class?: string
  style?: JSX.CSSProperties
}

const BASE_TRANSITION: Transition = {
  repeat: Infinity,
  ease: 'linear',
}

const BASE_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
  },
}

function resolveTarget(variant: Variant | undefined): TargetAndTransition | undefined {
  if (typeof variant === 'string')
    return undefined
  if (typeof variant === 'function') {
    const target = variant(0, {}, {})
    if (typeof target === 'string')
      return undefined
    return target
  }
  return variant
}

export function SpinningText(props: SpinningTextProps) {
  const merged = mergeProps(
    { duration: 10, reverse: false, radius: 5 } as const,
    props,
  )

  const childrenValue = untrack(() => merged.children)

  if (typeof childrenValue !== 'string' && !Array.isArray(childrenValue)) {
    throw new TypeError('children must be a string or an array of strings')
  }

  let targetText: string
  if (Array.isArray(childrenValue)) {
    if (!childrenValue.every(child => typeof child === 'string')) {
      throw new Error('all elements in children array must be strings')
    }
    targetText = childrenValue.join('')
  }
  else {
    targetText = childrenValue
  }

  const letters = () => {
    const chars = targetText.split('')
    chars.push(' ')
    return chars
  }

  const finalTransition = (): Transition => ({
    ...BASE_TRANSITION,
    ...merged.transition,
    duration: (merged.transition as { duration?: number } | undefined)?.duration ?? merged.duration,
  })

  const containerVariants = (): Variants => ({
    visible: { rotate: merged.reverse ? -360 : 360 },
    ...merged.variants?.container,
  })

  const itemVariants = (): Variants => ({
    ...BASE_ITEM_VARIANTS,
    ...merged.variants?.item,
  })

  let containerRef: HTMLDivElement | undefined
  const letterRefs: (HTMLSpanElement | undefined)[] = []

  onMount(() => {
    if (!containerRef)
      return

    const containerVisible = containerVariants().visible
    const rotate = typeof containerVisible === 'object' && containerVisible !== null
      ? (containerVisible as { rotate?: number }).rotate
      : undefined
    const target = rotate ?? (merged.reverse ? -360 : 360)

    const animation = animate(containerRef, { rotate: target }, finalTransition())
    onCleanup(() => animation.stop())
  })

  onMount(() => {
    const hidden = resolveTarget(itemVariants().hidden)
    const visible = resolveTarget(itemVariants().visible)
    if (!hidden && !visible)
      return

    const transition = finalTransition()
    const animations = letterRefs.flatMap((span) => {
      if (!span)
        return []
      const list = []
      if (hidden)
        list.push(animate(span, hidden, { duration: 0, delay: 0 }))
      if (visible)
        list.push(animate(span, visible, transition))
      return list
    })
    onCleanup(() => animations.forEach(a => a.stop()))
  })

  return (
    <div
      ref={containerRef}
      class={cn('relative', merged.class)}
      style={{
        ...merged.style,
      }}
    >
      <For each={letters()}>
        {(letter, index) => (
          <span
            aria-hidden="true"
            ref={(el) => {
              letterRefs[index()] = el
            }}
            class="absolute top-1/2 left-1/2 inline-block"
            style={
              {
                '--index': index(),
                '--total': letters().length,
                '--radius': merged.radius,
                'transform': `
                  translate(-50%, -50%)
                  rotate(calc(360deg / var(--total) * var(--index)))
                  translateY(calc(var(--radius, 5) * -1ch))
                `,
                'transform-origin': 'center',
              } as JSX.CSSProperties
            }
          >
            {letter}
          </span>
        )}
      </For>
      <span class="sr-only">{targetText}</span>
    </div>
  )
}
