import type { JSX } from '@solidjs/web'
import type { Accessor } from 'solid-js'

import { animate } from 'motion'
import { createContext, createEffect, createSignal, omit, onSettled, Show, useContext } from 'solid-js'

import { createFlip } from '@/lib/flip'
import { cn } from '@/lib/utils'

interface AnimatedListContextValue {
  registerItem: () => number
  currentIndex: Accessor<number>
}

const AnimatedListContext = createContext<AnimatedListContextValue>()

function AnimatedItem(props: { children: JSX.Element }) {
  let el: HTMLDivElement | undefined

  onSettled(() => {
    if (!el)
      return
    const animation = animate(
      el,
      { scale: [0, 1], opacity: [0, 1] },
      { type: 'spring', stiffness: 350, damping: 40 },
    )
    return () => animation.stop()
  })

  return (
    <div
      ref={el}
      class="mx-auto w-full"
      style={{ 'opacity': '0', 'transform': 'scale(0)', 'transform-origin': '50% 0%' }}
    >
      {props.children}
    </div>
  )
}

export function AnimatedListItem(props: { children: JSX.Element }) {
  const ctx = useContext(AnimatedListContext)
  const itemIndex = ctx?.registerItem() ?? 0
  const visible = () => (ctx ? ctx.currentIndex() >= itemIndex : true)

  return (
    <Show when={visible()}>
      <AnimatedItem>{props.children}</AnimatedItem>
    </Show>
  )
}

export interface AnimatedListProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
  delay?: number
}

export function AnimatedList(props: AnimatedListProps) {
  const rest = omit(props, 'children', 'class', 'delay')
  const delay = () => props.delay ?? 1000

  const [index, setIndex] = createSignal(0)
  const [childrenCount, setChildrenCount] = createSignal(0)
  // Count only: registration runs in a child's component body, where a
  // signal write is forbidden.
  let count = 0
  const registerItem = () => count++
  // Publish the total once all children have registered.
  onSettled(() => {
    setChildrenCount(count)
  })

  const flip = createFlip()

  createEffect(index, () => flip.flip())

  // `delay` is part of the compute so a change restarts the timer with the new
  // value; reading the destructured value keeps the apply free of subscriptions.
  createEffect(() => [index(), childrenCount(), delay()], ([indexValue, childrenCountValue, delayValue]) => {
    if (indexValue < childrenCountValue - 1) {
      const timeout = setTimeout(() => setIndex(prev => (prev + 1) % childrenCount()), delayValue)
      return () => clearTimeout(timeout)
    }
  })

  return (
    <AnimatedListContext value={{ registerItem, currentIndex: index }}>
      <div ref={flip.ref} class={cn('flex flex-col-reverse items-center gap-4', props.class)} {...rest}>
        {props.children}
      </div>
    </AnimatedListContext>
  )
}
