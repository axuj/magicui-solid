import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { createEffect, createSignal, omit } from 'solid-js'

import { createInView } from '@/lib/create-in-view'
import { cn } from '@/lib/utils'

interface NumberTickerProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'value'> {
  value: number
  startValue?: number
  direction?: 'up' | 'down'
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker(props: NumberTickerProps) {
  const rest = omit(props, 'value', 'startValue', 'direction', 'delay', 'decimalPlaces', 'class')
  const delay = () => props.delay ?? 0
  const direction = () => props.direction ?? 'up'
  const startValue = () => props.startValue ?? 0

  const [elementRef, setElementRef] = createSignal<HTMLSpanElement>()
  const isInView = createInView(elementRef, { once: true, margin: '0px' })

  createEffect(
    () => ({
      elementRef: elementRef(),
      isInView: isInView(),
      direction: direction(),
      value: props.value,
      startValue: startValue(),
      decimalPlaces: props.decimalPlaces,
      delay: delay(),
    }),
    ({ elementRef, isInView, direction, value, startValue, decimalPlaces: decimalPlacesValue, delay }) => {
      const el = elementRef
      if (!el || !isInView)
        return

      const from = direction === 'down' ? value : startValue
      const to = direction === 'down' ? startValue : value
      const decimalPlaces = (decimalPlacesValue ?? 0)

      let controls: ReturnType<typeof animate> | undefined
      const timer = setTimeout(() => {
        controls = animate(from, to, {
          type: 'spring',
          damping: 60,
          stiffness: 100,
          restDelta: 0.001,
          restSpeed: 0.01,
          onUpdate: (latest) => {
            if (el) {
              el.textContent = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
              }).format(Number(latest.toFixed(decimalPlaces)))
            }
          },
        })
      }, delay * 1000)

      return () => {
        clearTimeout(timer)
        controls?.stop()
      }
    },
  )

  return (
    <span
      ref={setElementRef}
      class={cn(
        `
          inline-block tracking-wider text-black tabular-nums
          dark:text-white
        `,
        props.class,
      )}
      {...rest}
    >
      {startValue()}
    </span>
  )
}
