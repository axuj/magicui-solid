import type { TargetAndTransition, Transition } from 'motion'
import { animate } from 'motion'
import { createEffect, createSignal, mergeProps, onCleanup, onMount, splitProps, untrack } from 'solid-js'
import { cn } from '@/lib/utils'

interface WordRotateMotionProps {
  initial?: TargetAndTransition
  animate?: TargetAndTransition
  exit?: TargetAndTransition
  transition?: Transition
}

interface WordRotateProps {
  words: string[]
  duration?: number
  motionProps?: WordRotateMotionProps
  class?: string
}

const defaultMotionProps: WordRotateMotionProps = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

export function WordRotate(props: WordRotateProps) {
  const merged = mergeProps({ duration: 2500, motionProps: defaultMotionProps }, props)
  const [local] = splitProps(merged, ['words', 'duration', 'motionProps', 'class'])

  const [index, setIndex] = createSignal(0)
  const [currentWord, setCurrentWord] = createSignal(untrack(() => local.words[0]) ?? '')
  let wordRef: HTMLHeadingElement | undefined
  let sequence = 0

  createEffect(() => {
    const interval = setInterval(() => {
      setIndex(prevIndex => (prevIndex + 1) % local.words.length)
    }, local.duration)

    onCleanup(() => clearInterval(interval))
  })

  // Play enter animation from the initial state to the animate target.
  // motion runs chained animate() calls in the same frame, so a zero-duration
  // jump to the initial values would be pre-empted by the enter animation that
  // follows (which would then start from the residual exit position). We
  // therefore wait for the initial jump to render (promise + next rAF) before
  // starting the enter animation.
  const playEnter = async (el: HTMLHeadingElement, initial: TargetAndTransition | undefined, enterTarget: TargetAndTransition | undefined, transition: Transition | undefined) => {
    if (!enterTarget)
      return
    if (initial) {
      await animate(el, initial, { duration: 0 })
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      animate(el, enterTarget, transition)
    }
    else {
      animate(el, enterTarget, transition)
    }
  }

  // Initial enter animation
  onMount(() => {
    const el = wordRef
    if (!el || !local.motionProps)
      return
    const { initial, animate: animateTarget, transition } = local.motionProps
    playEnter(el, initial, animateTarget, transition)
  })

  // Word transition: exit the old word, then enter the new one
  createEffect(() => {
    const targetWord = local.words[index()]
    if (targetWord === currentWord())
      return
    const el = wordRef
    if (!el || !local.motionProps)
      return
    const mission = ++sequence
    const { initial, animate: animateTarget, exit, transition } = local.motionProps
    const exitAnimation = animate(el, exit ?? { opacity: 0 }, transition)
    exitAnimation.then(() => {
      if (mission !== sequence)
        return
      setCurrentWord(targetWord)
      playEnter(el, initial, animateTarget, transition)
    })
  })

  return (
    <div class="overflow-hidden py-2">
      <h1
        ref={wordRef}
        class={cn(local.class)}
      >
        {currentWord()}
      </h1>
    </div>
  )
}
