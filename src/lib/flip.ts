import type { AnimationOptions, DOMKeyframesDefinition } from 'motion'
import { animate } from 'motion'
import { onCleanup } from 'solid-js'

export const layoutTransition: AnimationOptions = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1],
}

export interface CreateFlipOptions {
  transition?: AnimationOptions
}

export function createFlip(options: CreateFlipOptions = {}) {
  const transition = options.transition ?? layoutTransition
  let el: HTMLElement | undefined
  const positions = new WeakMap<HTMLElement, { top: number, left: number }>()
  const animations = new Map<HTMLElement, ReturnType<typeof animate>>()

  const ref = (node: HTMLElement) => {
    el = node
  }

  function flip() {
    const container = el
    if (!container)
      return
    for (const child of [...container.children] as HTMLElement[]) {
      const prev = positions.get(child)
      const top = child.offsetTop
      const left = child.offsetLeft
      const dx = prev ? prev.left - left : 0
      const dy = prev ? prev.top - top : 0
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        animations.get(child)?.stop()
        const animation = animate(
          child,
          { x: [dx, 0], y: [dy, 0] } as DOMKeyframesDefinition,
          transition,
        )
        animations.set(child, animation)
      }
      positions.set(child, { top, left })
    }
  }

  onCleanup(() => {
    for (const animation of animations.values())
      animation.stop()
    animations.clear()
  })

  return { ref, flip }
}
