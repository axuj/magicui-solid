import type { JSX, ValidComponent } from '@solidjs/web'
import type { AnimationOptions, AnimationPlaybackControls, ValueAnimationTransition } from 'motion'

import { Dynamic } from '@solidjs/web'
import { createScopedAnimate } from 'motion'

import { createMemo, createSignal, For, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

const HAS_SEGMENTER = typeof Intl !== 'undefined' && 'Segmenter' in Intl

function splitIntoCharacters(text: string): string[] {
  if (HAS_SEGMENTER) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

type RotateDirection = 'top' | 'right' | 'bottom' | 'left'

const ROTATION_MAP = {
  top: 'rotateX(90deg)',
  right: 'rotateY(90deg)',
  bottom: 'rotateX(-90deg)',
  left: 'rotateY(-90deg)',
} as const

const DEFAULT_TRANSITION: ValueAnimationTransition = {
  type: 'spring',
  damping: 30,
  stiffness: 300,
}

const SECOND_FACE_TRANSFORMS = {
  top: 'rotateX(-90deg) translateZ(0.5lh)',
  right:
    'rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)',
  bottom: 'rotateX(90deg) translateZ(0.5lh)',
  left: 'rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(50%) rotateY(-90deg) translateX(50%)',
} as const

const FRONT_FACE_TRANSFORMS = {
  top: 'translateZ(0.5lh)',
  bottom: 'translateZ(0.5lh)',
  left: 'rotateY(90deg) translateX(50%) rotateY(-90deg)',
  right: 'rotateY(-90deg) translateX(50%) rotateY(90deg)',
} as const

const CONTAINER_TRANSFORMS = {
  top: 'translateZ(-0.5lh)',
  bottom: 'translateZ(-0.5lh)',
  left: 'rotateY(90deg) translateX(50%) rotateY(-90deg)',
  right: 'rotateY(90deg) translateX(50%) rotateY(-90deg)',
} as const

interface Text3DFlipProps {
  children: JSX.Element
  as?: ValidComponent
  class?: string
  textClassName?: string
  flipTextClassName?: string
  staggerDuration?: number
  staggerFrom?: 'first' | 'last' | 'center' | number | 'random'
  transition?: ValueAnimationTransition | AnimationOptions
  rotateDirection?: RotateDirection
}

export default function Text3DFlip(props: Text3DFlipProps) {
  const rest = omit(props, 'children', 'as', 'class', 'textClassName', 'flipTextClassName', 'staggerDuration', 'staggerFrom', 'transition', 'rotateDirection')
  const staggerDuration = () => props.staggerDuration ?? 0.05
  const staggerFrom = () => props.staggerFrom ?? 'first'
  const transition = () => props.transition ?? DEFAULT_TRANSITION

  const scope = {
    current: undefined as HTMLElement | undefined,
    animations: [] as AnimationPlaybackControls[],
  }
  const scopedAnimate = createScopedAnimate({ scope })

  let isAnimating = false
  let isMounted = true
  onSettled(() => {
    return () => {
      isMounted = false
      isAnimating = false
      for (const animation of scope.animations)
        animation.stop()
      scope.animations.length = 0
    }
  })

  const [text, setText] = createSignal('')

  const rotationTransform = () => ROTATION_MAP[(props.rotateDirection ?? 'right')]

  const characters = createMemo(
    () => {
      const words = text().split(' ')
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }))
    },
  )

  const getStaggerDelay = (index: number, totalChars: number) => {
    // Read once so TypeScript can narrow the value across branches.
    const from = staggerFrom()
    if (from === 'first')
      return index * staggerDuration()
    if (from === 'last')
      return (totalChars - 1 - index) * staggerDuration()
    if (from === 'center') {
      const center = Math.floor(totalChars / 2)
      return Math.abs(center - index) * staggerDuration()
    }
    if (from === 'random') {
      const randomIndex = Math.floor(Math.random() * totalChars)
      return Math.abs(randomIndex - index) * staggerDuration()
    }
    return Math.abs(from - index) * staggerDuration()
  }

  const handleHoverStart = async () => {
    if (isAnimating)
      return
    isAnimating = true

    try {
      const totalChars = characters().reduce(
        (sum, word) => sum + word.characters.length,
        0,
      )

      const delays: number[] = []
      for (let i = 0; i < totalChars; i++) {
        delays.push(getStaggerDelay(i, totalChars))
      }

      await scopedAnimate(
        '.text-3d-flip-char',
        { transform: rotationTransform() },
        { ...transition(), delay: (i: number) => delays[i] },
      )

      if (!isMounted)
        return

      await scopedAnimate(
        '.text-3d-flip-char',
        { transform: 'rotateX(0deg) rotateY(0deg)' },
        { duration: 0 },
      )
    }
    finally {
      if (isMounted) {
        isAnimating = false
      }
    }
  }

  return (
    <Dynamic
      component={(props.as ?? 'p')}
      class={cn('relative flex flex-wrap', props.class)}
      onMouseEnter={handleHoverStart}
      ref={(el: HTMLElement) => {
        scope.current = el
      }}
      {...rest}
    >
      <span
        ref={(el) => {
          onSettled(() => {
            setText(el.textContent ?? '')
          })
        }}
        class="sr-only"
      >
        {props.children}
      </span>

      <For each={characters()}>
        {wordObj => (
          <span class="inline-flex">
            <For each={wordObj.characters}>
              {char => (
                <CharBox
                  char={char}
                  textClassName={props.textClassName}
                  flipTextClassName={props.flipTextClassName}
                  rotateDirection={(props.rotateDirection ?? 'right')}
                />
              )}
            </For>
            {wordObj.needsSpace && <span class="whitespace-pre"> </span>}
          </span>
        )}
      </For>
    </Dynamic>
  )
}

interface CharBoxProps {
  char: string
  textClassName?: string
  flipTextClassName?: string
  rotateDirection: RotateDirection
}

function CharBox(props: CharBoxProps) {
  return (
    <span
      class="text-3d-flip-char inline transform-3d"
      style={{ transform: CONTAINER_TRANSFORMS[props.rotateDirection] }}
    >
      <span
        class={cn('relative h-lh backface-hidden', props.textClassName)}
        style={{ transform: FRONT_FACE_TRANSFORMS[props.rotateDirection] }}
      >
        {props.char}
      </span>
      <span
        class={cn(
          'absolute top-0 left-0 h-lh backface-hidden',
          props.flipTextClassName,
        )}
        style={{ transform: SECOND_FACE_TRANSFORMS[props.rotateDirection] }}
      >
        {props.char}
      </span>
    </span>
  )
}
