import type { Accessor, JSX } from 'solid-js'
import { createContext, createEffect, createSignal, mergeProps, onCleanup, splitProps, untrack, useContext } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { createInView } from '@/lib/create-in-view'
import { cn } from '@/lib/utils'

interface SequenceContextValue {
  completeItem: (index: number) => void
  activeIndex: Accessor<number>
  sequenceStarted: Accessor<boolean>
  registerItem: () => number
}

const SequenceContext = createContext<SequenceContextValue | null>(null)

function useSequence() {
  return useContext(SequenceContext)
}

function useElementVisibility(element: Accessor<HTMLElement | undefined>) {
  return createInView(element, { amount: 0.3, once: true })
}

interface AnimatedSpanProps {
  children: JSX.Element
  delay?: number
  class?: string
  startOnView?: boolean
}

export function AnimatedSpan(props: AnimatedSpanProps) {
  const merged = mergeProps({ delay: 0, startOnView: false }, props)
  const [local, rest] = splitProps(merged, ['children', 'delay', 'class', 'startOnView'])

  let elementRef: HTMLDivElement | undefined
  const isInView = useElementVisibility(() => elementRef)

  const sequence = useSequence()
  const itemIndex = sequence ? sequence.registerItem() : null
  const [hasStarted, setHasStarted] = createSignal(false)

  createEffect(() => {
    if (untrack(hasStarted))
      return

    if (sequence && itemIndex !== null) {
      if (sequence.sequenceStarted() && sequence.activeIndex() === itemIndex) {
        setHasStarted(true)
      }
    }
    else {
      if (!local.startOnView || isInView()) {
        const timer = setTimeout(setHasStarted, local.delay, true)
        onCleanup(() => clearTimeout(timer))
      }
    }
  })

  return (
    <div
      ref={elementRef}
      class={cn(
        'grid text-sm font-normal tracking-tight transition-all duration-300',
        hasStarted() ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
        local.class,
      )}
      style={{ 'transition-delay': '0ms' }}
      onTransitionEnd={() => {
        if (sequence && itemIndex !== null) {
          sequence.completeItem(itemIndex)
        }
      }}
      {...rest}
    >
      {local.children}
    </div>
  )
}

interface TypingAnimationProps {
  children: string
  class?: string
  duration?: number
  delay?: number
  as?: string
  startOnView?: boolean
}

export function TypingAnimation(props: TypingAnimationProps) {
  const merged = mergeProps({ duration: 60, delay: 0, as: 'span', startOnView: true }, props)
  const [local, rest] = splitProps(merged, ['children', 'class', 'duration', 'delay', 'as', 'startOnView'])

  let elementRef: HTMLElement | undefined
  const isInView = useElementVisibility(() => elementRef)

  const [displayedText, setDisplayedText] = createSignal('')
  const [started, setStarted] = createSignal(false)

  const sequence = useSequence()
  const itemIndex = sequence ? sequence.registerItem() : null

  createEffect(() => {
    if (untrack(started))
      return

    if (sequence && itemIndex !== null) {
      if (sequence.sequenceStarted() && sequence.activeIndex() === itemIndex) {
        setStarted(true)
      }
    }
    else {
      if (!local.startOnView || isInView()) {
        const timer = setTimeout(setStarted, local.delay, true)
        onCleanup(() => clearTimeout(timer))
      }
    }
  })

  createEffect(() => {
    if (!started())
      return

    const textToType = local.children
    let i = 0
    const interval = setInterval(() => {
      if (i < textToType.length) {
        setDisplayedText(textToType.substring(0, i + 1))
        i++
      }
      else {
        clearInterval(interval)
        if (sequence && itemIndex !== null) {
          sequence.completeItem(itemIndex)
        }
      }
    }, local.duration)

    onCleanup(() => clearInterval(interval))
  })

  return (
    <Dynamic
      component={local.as}
      ref={elementRef}
      class={cn('inline-grid text-sm font-normal tracking-tight', local.class)}
      {...rest}
    >
      <span class="invisible [grid-area:1/1]" aria-hidden="true">
        {local.children}
      </span>
      <span class="[grid-area:1/1]">
        {displayedText()}
      </span>
    </Dynamic>
  )
}

interface TerminalProps {
  children: JSX.Element
  class?: string
  sequence?: boolean
  startOnView?: boolean
}

export function Terminal(props: TerminalProps) {
  const merged = mergeProps({ sequence: true, startOnView: true }, props)
  const [local, rest] = splitProps(merged, ['children', 'class', 'sequence', 'startOnView'])

  let containerRef: HTMLDivElement | undefined
  const isInView = useElementVisibility(() => containerRef)

  const [activeIndex, setActiveIndex] = createSignal(0)
  const sequenceStarted = () => local.sequence ? (!local.startOnView || isInView()) : false

  let registeredCount = 0

  const contextValue: SequenceContextValue = {
    completeItem: (index: number) => {
      setActiveIndex(current => (index === current ? current + 1 : current))
    },
    activeIndex,
    sequenceStarted,
    registerItem: () => registeredCount++,
  }

  return (
    <SequenceContext.Provider value={untrack(() => local.sequence) ? contextValue : null}>
      <div
        ref={containerRef}
        class={cn(
          'z-0 size-full max-w-lg rounded-xl border bg-background',
          local.class,
        )}
        {...rest}
      >
        <div class="flex flex-col gap-y-2 border-b p-4">
          <div class="flex flex-row gap-x-2">
            <div class="size-2 rounded-full bg-red-500" />
            <div class="size-2 rounded-full bg-yellow-500" />
            <div class="size-2 rounded-full bg-green-500" />
          </div>
        </div>
        <pre class="p-4">
          <code class="grid gap-y-1 overflow-auto">{local.children}</code>
        </pre>
      </div>
    </SequenceContext.Provider>
  )
}
