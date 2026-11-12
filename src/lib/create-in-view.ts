import type { Accessor } from 'solid-js'

import { inView } from 'motion'
import { createEffect, createSignal } from 'solid-js'

type InViewOptions = NonNullable<Parameters<typeof inView>[2]>
type MaybeAccessor<T> = T | Accessor<T>

type ReactiveInViewOptions = {
  [K in keyof InViewOptions]: MaybeAccessor<InViewOptions[K]>
}

export interface CreateInViewOptions extends ReactiveInViewOptions {
  /**
   * Whether to trigger only once. When `true`, the signal stays `true`
   * after the first time the element enters the viewport.
   * @default false
   */
  once?: MaybeAccessor<boolean>
}

function readOption<T>(value: MaybeAccessor<T> | undefined): T | undefined {
  return typeof value === 'function' ? (value as Accessor<T>)() : value
}

/**
 * Reactive wrapper around motion's `inView`.
 * Returns a signal that is `true` while the target is inside the viewport.
 *
 * Every option may be a plain value or an accessor. Options are read in the
 * compute phase of an effect, so changing one disposes the current observer
 * and creates a new one. A fresh IntersectionObserver reports the current
 * state immediately, so a changed `once` takes effect without waiting for
 * another scroll. Plain values keep the observer alive for the component's
 * whole lifetime. Keep option accessors free of DOM reads: compute also runs
 * on the server.
 *
 * @param elementSignal A getter from `createSignal`, written to by a ref
 * callback. TypeScript cannot distinguish it from any other `() => Element`,
 * so this is a documented contract, not a type-level guarantee: a plain
 * `() => letEl` compiles, but compute evaluates before the ref callback runs
 * and the effect then has no dependency to re-run on. Store the ref in a
 * signal (`const [el, setEl] = createSignal()`, `ref={setEl}`) or use
 * `onSettled` with a plain `let` for one-time setup.
 */
export function createInView(
  elementSignal: Accessor<Element | null | undefined>,
  options: CreateInViewOptions = {},
) {
  const [inViewport, setInViewport] = createSignal(false)

  createEffect(
    () => ({
      el: elementSignal(),
      once: readOption(options.once) ?? false,
      root: readOption(options.root),
      margin: readOption(options.margin),
      amount: readOption(options.amount),
    }),
    ({ el, once, root, margin, amount }) => {
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
        { root, margin, amount },
      )

      return () => stop?.()
    },
  )

  return inViewport
}
