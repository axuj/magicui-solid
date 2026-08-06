import { inView } from 'motion'
import { createEffect, createSignal, onCleanup } from 'solid-js'

type InViewOptions = NonNullable<Parameters<typeof inView>[2]>

export interface CreateInViewOptions extends InViewOptions {
  /**
   * Whether to trigger only once. When `true`, the signal stays `true`
   * after the first time the element enters the viewport.
   * @default false
   */
  once?: boolean
}

/**
 * Reactive wrapper around motion's `inView`.
 * Returns a signal that is `true` while the target is inside the viewport.
 */
export function createInView(
  target: () => Element | null | undefined,
  options: CreateInViewOptions = {},
) {
  const [inViewport, setInViewport] = createSignal(false)
  const { once = false, ...inViewOptions } = options

  createEffect(() => {
    const el = target()
    if (!el)
      return
    const stop = inView(
      el,
      () => {
        setInViewport(true)
        if (once) {
          stop?.()
          return
        }
        return () => setInViewport(false)
      },
      inViewOptions,
    )
    onCleanup(stop)
  })

  return inViewport
}
