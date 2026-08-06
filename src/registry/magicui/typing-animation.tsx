import type { JSX, ValidComponent } from 'solid-js'
import { createEffect, createMemo, createSignal, mergeProps, on, onCleanup, Show, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { createInView } from '@/lib/create-in-view'
import { cn } from '@/lib/utils'

interface TypingAnimationProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
  children?: string
  words?: string[]
  duration?: number
  typeSpeed?: number
  deleteSpeed?: number
  delay?: number
  pauseDelay?: number
  loop?: boolean
  as?: ValidComponent
  startOnView?: boolean
  showCursor?: boolean
  blinkCursor?: boolean
  cursorStyle?: 'line' | 'block' | 'underscore'
}

export function TypingAnimation(props: TypingAnimationProps) {
  const merged = mergeProps(
    {
      duration: 100,
      delay: 0,
      pauseDelay: 1000,
      loop: false,
      as: 'span',
      startOnView: true,
      showCursor: true,
      blinkCursor: true,
      cursorStyle: 'line',
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'children',
    'words',
    'class',
    'duration',
    'typeSpeed',
    'deleteSpeed',
    'delay',
    'pauseDelay',
    'loop',
    'as',
    'startOnView',
    'showCursor',
    'blinkCursor',
    'cursorStyle',
  ])

  const [displayedText, setDisplayedText] = createSignal('')
  const [currentWordIndex, setCurrentWordIndex] = createSignal(0)
  const [currentCharIndex, setCurrentCharIndex] = createSignal(0)
  const [phase, setPhase] = createSignal<'typing' | 'pause' | 'deleting'>('typing')

  let elementRef: HTMLElement | undefined
  const isInView = createInView(() => elementRef, { amount: 0.3, once: true })

  const wordsToAnimate = createMemo(() => local.words ?? (local.children ? [local.children] : []))
  const hasMultipleWords = createMemo(() => wordsToAnimate().length > 1)

  const typingSpeed = () => local.typeSpeed ?? local.duration
  const deletingSpeed = () => local.deleteSpeed ?? typingSpeed() / 2

  const shouldStart = () => (local.startOnView ? isInView() : true)
  const animationSourceKey = createMemo(() => local.words ? local.words.join('\u0000') : (local.children ?? ''))

  createEffect(on(animationSourceKey, () => {
    setDisplayedText('')
    setCurrentWordIndex(0)
    setCurrentCharIndex(0)
    setPhase('typing')
  }))

  createEffect(() => {
    if (!shouldStart() || wordsToAnimate().length === 0)
      return

    const wordIndex = currentWordIndex()
    const charIndex = currentCharIndex()
    const currentPhase = phase()
    const currentWord = wordsToAnimate()[wordIndex] || ''
    const graphemes = Array.from(currentWord)

    const timeoutDelay = local.delay > 0 && displayedText() === ''
      ? local.delay
      : currentPhase === 'typing'
        ? typingSpeed()
        : currentPhase === 'deleting'
          ? deletingSpeed()
          : local.pauseDelay

    const timeout = setTimeout(() => {
      switch (currentPhase) {
        case 'typing':
          if (charIndex < graphemes.length) {
            setDisplayedText(graphemes.slice(0, charIndex + 1).join(''))
            setCurrentCharIndex(charIndex + 1)
          }
          else {
            if (hasMultipleWords() || local.loop) {
              const isLastWord = wordIndex === wordsToAnimate().length - 1
              if (!isLastWord || local.loop) {
                setPhase('pause')
              }
            }
          }
          break

        case 'pause':
          setPhase('deleting')
          break

        case 'deleting':
          if (charIndex > 0) {
            setDisplayedText(graphemes.slice(0, charIndex - 1).join(''))
            setCurrentCharIndex(charIndex - 1)
          }
          else {
            const nextIndex = (wordIndex + 1) % wordsToAnimate().length
            setCurrentWordIndex(nextIndex)
            setPhase('typing')
          }
          break
      }
    }, timeoutDelay)

    onCleanup(() => clearTimeout(timeout))
  })

  const currentWordGraphemes = createMemo(() => Array.from(wordsToAnimate()[currentWordIndex()] || ''))
  const isComplete = createMemo(() => (
    !local.loop
    && currentWordIndex() === wordsToAnimate().length - 1
    && currentCharIndex() >= currentWordGraphemes().length
    && phase() !== 'deleting'
  ))

  const shouldShowCursor = createMemo(() => (
    local.showCursor
    && !isComplete()
    && (hasMultipleWords() || local.loop || currentCharIndex() < currentWordGraphemes().length)
  ))

  const getCursorChar = () => {
    switch (local.cursorStyle) {
      case 'block':
        return '▌'
      case 'underscore':
        return '_'
      case 'line':
      default:
        return '|'
    }
  }

  return (
    <Dynamic
      component={local.as}
      ref={elementRef}
      class={cn(
        'leading-20 tracking-[-0.02em]',
        local.as === 'span' && 'inline-block',
        local.class,
      )}
      {...rest}
    >
      {displayedText()}
      <Show when={shouldShowCursor()}>
        <span class={cn('inline-block', local.blinkCursor && `
          animate-blink-cursor
        `)}
        >
          {getCursorChar()}
        </span>
      </Show>
    </Dynamic>
  )
}
