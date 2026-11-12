import type { JSX, ValidComponent } from '@solidjs/web'
import type { Accessor } from 'solid-js'

import { Dynamic } from '@solidjs/web'

import { createContext, createEffect, createSignal, omit, untrack, useContext } from 'solid-js'

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
  const rest = omit(props, 'children', 'delay', 'class', 'startOnView')

  const [elementRef, setElementRef] = createSignal<HTMLDivElement>()
  const isInView = useElementVisibility(elementRef)

  const sequence = useSequence()
  const itemIndex = sequence ? sequence.registerItem() : null
  const [hasStarted, setHasStarted] = createSignal(false)

  createEffect(
    () => ({
      sequenceStarted: sequence?.sequenceStarted(),
      activeIndex: sequence?.activeIndex(),
      startOnView: props.startOnView,
      isInView: isInView(),
      delay: props.delay,
    }),
    ({ sequenceStarted, activeIndex, startOnView, isInView, delay }) => {
      // Deliberately not a dependency: subscribing to the gate would make
      // `setHasStarted(true)` re-run this effect.
      if (untrack(() => hasStarted()))
        return

      if (sequence && itemIndex !== null) {
        if (sequenceStarted && activeIndex === itemIndex) {
          setHasStarted(true)
        }
      }
      else {
        if (!(startOnView ?? false) || isInView) {
          const timer = setTimeout(setHasStarted, (delay ?? 0), true)
          return () => clearTimeout(timer)
        }
      }
    },
  )

  return (
    <div
      ref={setElementRef}
      class={cn(
        'grid text-sm font-normal tracking-tight transition-all duration-300',
        hasStarted() ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
        props.class,
      )}
      style={{ 'transition-delay': '0ms' }}
      onTransitionEnd={() => {
        if (sequence && itemIndex !== null) {
          sequence.completeItem(itemIndex)
        }
      }}
      {...rest}
    >
      {props.children}
    </div>
  )
}

interface TypingAnimationProps {
  children: string
  class?: string
  duration?: number
  delay?: number
  as?: ValidComponent
  startOnView?: boolean
}

export function TypingAnimation(props: TypingAnimationProps) {
  const rest = omit(props, 'children', 'class', 'duration', 'delay', 'as', 'startOnView')

  const [elementRef, setElementRef] = createSignal<HTMLElement>()
  const isInView = useElementVisibility(elementRef)

  const [displayedText, setDisplayedText] = createSignal('')
  const [started, setStarted] = createSignal(false)

  const sequence = useSequence()
  const itemIndex = sequence ? sequence.registerItem() : null

  createEffect(
    () => ({
      sequenceStarted: sequence?.sequenceStarted(),
      activeIndex: sequence?.activeIndex(),
      startOnView: props.startOnView,
      isInView: isInView(),
      delay: props.delay,
    }),
    ({ sequenceStarted, activeIndex, startOnView, isInView, delay }) => {
      // Same as above: the gate is read as a snapshot, never tracked.
      if (untrack(() => started()))
        return

      if (sequence && itemIndex !== null) {
        if (sequenceStarted && activeIndex === itemIndex) {
          setStarted(true)
        }
      }
      else {
        if (!(startOnView ?? true) || isInView) {
          const timer = setTimeout(setStarted, (delay ?? 0), true)
          return () => clearTimeout(timer)
        }
      }
    },
  )

  createEffect(
    () => ({
      started: started(),
      children: props.children,
      duration: props.duration,
    }),
    ({ started, children, duration }) => {
      if (!started)
        return

      const textToType = children
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
      }, duration ?? 60)

      return () => clearInterval(interval)
    },
  )

  return (
    <Dynamic
      component={props.as ?? 'span'}
      ref={setElementRef}
      class={cn('inline-grid text-sm font-normal tracking-tight', props.class)}
      {...rest}
    >
      <span class="invisible [grid-area:1/1]" aria-hidden="true">
        {props.children}
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
  const rest = omit(props, 'children', 'class', 'sequence', 'startOnView')

  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>()
  const isInView = useElementVisibility(containerRef)

  const [activeIndex, setActiveIndex] = createSignal(0)
  // Read inside the derived accessor rather than capturing it here, so the
  // effects that consume it keep tracking `sequence`.
  const sequenceStarted = () => (props.sequence ?? true) ? (!(props.startOnView ?? true) || isInView()) : false
  // The context value is built once, so this one is a snapshot by design.
  const sequenceEnabled = untrack(() => props.sequence ?? true)

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
    <SequenceContext value={sequenceEnabled ? contextValue : null}>
      <div
        ref={setContainerRef}
        class={cn(
          'z-0 size-full max-w-lg rounded-xl border bg-background',
          props.class,
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
          <code class="grid gap-y-1 overflow-auto">{props.children}</code>
        </pre>
      </div>
    </SequenceContext>
  )
}
