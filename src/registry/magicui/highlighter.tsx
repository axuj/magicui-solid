import type { JSX } from '@solidjs/web'
import type { RoughAnnotation } from 'rough-notation/lib/model'

import { annotate } from 'rough-notation'
import { createEffect, createSignal } from 'solid-js'

import { createInView } from '@/lib/create-in-view'

export type AnnotationAction
  = | 'highlight'
    | 'underline'
    | 'box'
    | 'circle'
    | 'strike-through'
    | 'crossed-off'
    | 'bracket'

interface HighlighterProps {
  children: JSX.Element
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

export function Highlighter(props: HighlighterProps) {
  const action = () => props.action ?? 'highlight'

  const [elementRef, setElementRef] = createSignal<HTMLSpanElement>()
  const isInView = createInView(elementRef, { once: true, margin: '-10%' })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = () => !(props.isView ?? false) || isInView()

  createEffect(
    () => ({ elementRef: elementRef(), shouldShow: shouldShow(), action: action(), color: props.color, strokeWidth: props.strokeWidth, animationDuration: props.animationDuration, iterations: props.iterations, padding: props.padding, multiline: props.multiline }),
    ({ elementRef, shouldShow, action, color, strokeWidth, animationDuration, iterations, padding, multiline }) => {
      let annotation: RoughAnnotation | null = null
      let resizeObserver: ResizeObserver | null = null

      const el = elementRef
      if (shouldShow && el) {
        const annotationConfig = {
          type: action,
          color: (color ?? '#ffd1dc'),
          strokeWidth: (strokeWidth ?? 1.5),
          animationDuration: (animationDuration ?? 600),
          iterations: (iterations ?? 2),
          padding: (padding ?? 2),
          multiline: (multiline ?? true),
        }

        const currentAnnotation = annotate(el, annotationConfig)
        annotation = currentAnnotation
        currentAnnotation.show()

        resizeObserver = new ResizeObserver(() => {
          currentAnnotation.hide()
          currentAnnotation.show()
        })

        resizeObserver.observe(el)
        resizeObserver.observe(document.body)
      }

      return () => {
        annotation?.remove()
        resizeObserver?.disconnect()
      }
    },
  )

  return (
    <span ref={setElementRef} class="relative inline-block bg-transparent">
      {props.children}
    </span>
  )
}
