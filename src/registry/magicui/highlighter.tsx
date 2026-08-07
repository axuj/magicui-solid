import type { RoughAnnotation } from 'rough-notation/lib/model'
import type { JSX } from 'solid-js'
import { annotate } from 'rough-notation'
import { createEffect, mergeProps, onCleanup } from 'solid-js'
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
  const merged = mergeProps(
    {
      action: 'highlight',
      color: '#ffd1dc',
      strokeWidth: 1.5,
      animationDuration: 600,
      iterations: 2,
      padding: 2,
      multiline: true,
      isView: false,
    } as const,
    props,
  )

  let elementRef: HTMLSpanElement | undefined
  const isInView = createInView(() => elementRef, { once: true, margin: '-10%' })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = () => !merged.isView || isInView()

  createEffect(() => {
    let annotation: RoughAnnotation | null = null
    let resizeObserver: ResizeObserver | null = null

    if (shouldShow() && elementRef) {
      const annotationConfig = {
        type: merged.action,
        color: merged.color,
        strokeWidth: merged.strokeWidth,
        animationDuration: merged.animationDuration,
        iterations: merged.iterations,
        padding: merged.padding,
        multiline: merged.multiline,
      }

      const currentAnnotation = annotate(elementRef, annotationConfig)
      annotation = currentAnnotation
      currentAnnotation.show()

      resizeObserver = new ResizeObserver(() => {
        currentAnnotation.hide()
        currentAnnotation.show()
      })

      resizeObserver.observe(elementRef)
      resizeObserver.observe(document.body)
    }

    onCleanup(() => {
      annotation?.remove()
      resizeObserver?.disconnect()
    })
  })

  return (
    <span ref={elementRef} class="relative inline-block bg-transparent">
      {merged.children}
    </span>
  )
}
