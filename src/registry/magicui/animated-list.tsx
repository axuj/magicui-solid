import type { Accessor, JSX } from 'solid-js'
import { animate } from 'motion'
import { createContext, createEffect, createSignal, mergeProps, on, onCleanup, onMount, Show, splitProps, useContext } from 'solid-js'
import { createFlip } from '@/lib/flip'
import { cn } from '@/lib/utils'

interface AnimatedListContextValue {
  registerItem: () => number
  currentIndex: Accessor<number>
}

const AnimatedListContext = createContext<AnimatedListContextValue>()

function AnimatedItem(props: { children: JSX.Element }) {
  let el: HTMLDivElement | undefined

  onMount(() => {
    if (!el)
      return
    const animation = animate(
      el,
      { scale: [0, 1], opacity: [0, 1] },
      { type: 'spring', stiffness: 350, damping: 40 },
    )
    onCleanup(() => animation.stop())
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
  const merged = mergeProps({ delay: 1000 }, props)
  const [local, rest] = splitProps(merged, ['children', 'class', 'delay'])

  const [index, setIndex] = createSignal(0)
  const [childrenCount, setChildrenCount] = createSignal(0)
  let count = 0
  const registerItem = () => {
    setChildrenCount(++count)
    return count - 1
  }

  const flip = createFlip()

  createEffect(on(index, () => flip.flip()))

  createEffect(() => {
    if (index() < childrenCount() - 1) {
      const timeout = setTimeout(() => setIndex(prev => (prev + 1) % childrenCount()), local.delay)
      onCleanup(() => clearTimeout(timeout))
    }
  })

  return (
    <AnimatedListContext.Provider value={{ registerItem, currentIndex: index }}>
      <div ref={flip.ref} class={cn('flex flex-col-reverse items-center gap-4', local.class)} {...rest}>
        {local.children}
      </div>
    </AnimatedListContext.Provider>
  )
}
