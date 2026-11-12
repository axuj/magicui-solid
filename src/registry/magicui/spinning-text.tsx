import type { JSX } from '@solidjs/web'
import type { TargetAndTransition, Transition, Variant, Variants } from 'motion'

import { animate } from 'motion'
import { createMemo, For, onSettled, untrack } from 'solid-js'

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
  const radius = () => props.radius ?? 5
  const reverse = () => props.reverse ?? false

  // Derived from children so a change re-renders letters and the sr-only text
  const targetText = createMemo(() => {
    const childrenValue = props.children
    if (typeof childrenValue !== 'string' && !Array.isArray(childrenValue)) {
      throw new TypeError('children must be a string or an array of strings')
    }
    if (Array.isArray(childrenValue)) {
      if (!childrenValue.every(child => typeof child === 'string')) {
        throw new Error('all elements in children array must be strings')
      }
      return childrenValue.join('')
    }
    return childrenValue
  })

  const letters = () => {
    const chars = targetText().split('')
    chars.push(' ')
    return chars
  }

  const finalTransition = (): Transition => ({
    ...BASE_TRANSITION,
    ...props.transition,
    duration: (props.transition as { duration?: number } | undefined)?.duration ?? (props.duration ?? 10),
  })

  const containerVariants = (): Variants => ({
    visible: { rotate: reverse() ? -360 : 360 },
    ...props.variants?.container,
  })

  const itemVariants = (): Variants => ({
    ...BASE_ITEM_VARIANTS,
    ...props.variants?.item,
  })

  let containerRef: HTMLDivElement | undefined
  const letterRefs: (HTMLSpanElement | undefined)[] = []

  onSettled(() => {
    if (!containerRef)
      return

    const containerVisible = containerVariants().visible
    const rotate = typeof containerVisible === 'object' && containerVisible !== null
      ? (containerVisible as { rotate?: number }).rotate
      : undefined
    const target = rotate ?? (reverse() ? -360 : 360)

    const transition = finalTransition()
    const animation = animate(containerRef, { rotate: target }, transition)
    return () => animation.stop()
  })

  onSettled(() => {
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
    return () => animations.forEach(a => a.stop())
  })

  return (
    <div
      ref={containerRef}
      class={cn('relative', props.class)}
      style={{
        ...props.style,
      }}
    >
      <For each={letters()}>
        {(letter, index) => (
          <span
            aria-hidden="true"
            ref={(el) => {
              letterRefs[untrack(index)] = el
            }}
            class="absolute top-1/2 left-1/2 inline-block"
            style={
              {
                '--index': index(),
                '--total': letters().length,
                '--radius': radius(),
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
      <span class="sr-only">{targetText()}</span>
    </div>
  )
}
