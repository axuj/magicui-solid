import type { JSX, ValidComponent } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'

import { createEffect, createMemo, createSignal, omit, Show } from 'solid-js'

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
  const rest = omit(props, 'children', 'words', 'class', 'duration', 'typeSpeed', 'deleteSpeed', 'delay', 'pauseDelay', 'loop', 'as', 'startOnView', 'showCursor', 'blinkCursor', 'cursorStyle')
  const as = () => props.as ?? 'span'
  const blinkCursor = () => props.blinkCursor ?? true
  const cursorStyle = () => props.cursorStyle ?? 'line'
  const delay = () => props.delay ?? 0
  const duration = () => props.duration ?? 100
  const loop = () => props.loop ?? false
  const pauseDelay = () => props.pauseDelay ?? 1000
  const showCursor = () => props.showCursor ?? true
  const startOnView = () => props.startOnView ?? true

  const [displayedText, setDisplayedText] = createSignal('')
  const [currentWordIndex, setCurrentWordIndex] = createSignal(0)
  const [currentCharIndex, setCurrentCharIndex] = createSignal(0)
  const [phase, setPhase] = createSignal<'typing' | 'pause' | 'deleting'>('typing')

  const [elementRef, setElementRef] = createSignal<HTMLElement>()
  const isInView = createInView(elementRef, { amount: 0.3, once: true })

  const wordsToAnimate = createMemo(() => props.words ?? (props.children ? [props.children] : []))
  const hasMultipleWords = createMemo(() => wordsToAnimate().length > 1)

  const typingSpeed = () => props.typeSpeed ?? duration()
  const deletingSpeed = () => props.deleteSpeed ?? typingSpeed() / 2

  const shouldStart = () => (startOnView() ? isInView() : true)
  const animationSourceKey = createMemo(() => props.words ? props.words.join('\u0000') : (props.children ?? ''))

  createEffect(animationSourceKey, () => {
    setDisplayedText('')
    setCurrentWordIndex(0)
    setCurrentCharIndex(0)
    setPhase('typing')
  })

  createEffect(
    () => ({
      shouldStart: shouldStart(),
      wordsToAnimate: wordsToAnimate(),
      currentWordIndex: currentWordIndex(),
      currentCharIndex: currentCharIndex(),
      phase: phase(),
      displayedText: displayedText(),
      delay: delay(),
      typingSpeed: typingSpeed(),
      deletingSpeed: deletingSpeed(),
      pauseDelay: pauseDelay(),
      hasMultipleWords: hasMultipleWords(),
      loop: loop(),
    }),
    ({ shouldStart, wordsToAnimate: wordsToAnimateValue, currentWordIndex, currentCharIndex, phase, displayedText, delay, typingSpeed, deletingSpeed, pauseDelay }) => {
      if (!shouldStart || wordsToAnimateValue.length === 0)
        return

      const wordIndex = currentWordIndex
      const charIndex = currentCharIndex
      const currentPhase = phase
      const currentWord = wordsToAnimateValue[wordIndex] || ''
      const graphemes = Array.from(currentWord)

      const timeoutDelay = delay > 0 && displayedText === ''
        ? delay
        : currentPhase === 'typing'
          ? typingSpeed
          : currentPhase === 'deleting'
            ? deletingSpeed
            : pauseDelay

      const timeout = setTimeout(() => {
        switch (currentPhase) {
          case 'typing':
            if (charIndex < graphemes.length) {
              setDisplayedText(graphemes.slice(0, charIndex + 1).join(''))
              setCurrentCharIndex(charIndex + 1)
            }
            else {
              if (hasMultipleWords() || loop()) {
                const isLastWord = wordIndex === wordsToAnimate().length - 1
                if (!isLastWord || loop()) {
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

      return () => clearTimeout(timeout)
    },
  )

  const currentWordGraphemes = createMemo(() => Array.from(wordsToAnimate()[currentWordIndex()] || ''))
  const isComplete = () => (
    !loop()
    && currentWordIndex() === wordsToAnimate().length - 1
    && currentCharIndex() >= currentWordGraphemes().length
    && phase() !== 'deleting'
  )

  const shouldShowCursor = () => (
    showCursor()
    && !isComplete()
    && (hasMultipleWords() || loop() || currentCharIndex() < currentWordGraphemes().length)
  )

  const getCursorChar = () => {
    switch (cursorStyle()) {
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
      component={as()}
      ref={setElementRef}
      class={cn(
        'leading-20 tracking-[-0.02em]',
        as() === 'span' && 'inline-block',
        props.class,
      )}
      {...rest}
    >
      {displayedText()}
      <Show when={shouldShowCursor()}>
        <span class={cn('inline-block', blinkCursor() && `animate-blink-cursor`)}>
          {getCursorChar()}
        </span>
      </Show>
    </Dynamic>
  )
}
