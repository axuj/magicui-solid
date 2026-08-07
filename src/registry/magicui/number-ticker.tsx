import type { JSX } from 'solid-js'
import { animate } from 'motion'
import { createEffect, mergeProps, onCleanup, splitProps } from 'solid-js'
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
  const merged = mergeProps({ startValue: 0, direction: 'up', delay: 0, decimalPlaces: 0 }, props)
  const [local, rest] = splitProps(merged, ['value', 'startValue', 'direction', 'delay', 'decimalPlaces', 'class'])

  let elementRef: HTMLSpanElement | undefined
  const isInView = createInView(() => elementRef, { once: true, margin: '0px' })

  createEffect(() => {
    if (!elementRef || !isInView())
      return

    const from = local.direction === 'down' ? local.value : local.startValue
    const to = local.direction === 'down' ? local.startValue : local.value
    const decimalPlaces = local.decimalPlaces

    let controls: ReturnType<typeof animate> | undefined
    const timer = setTimeout(() => {
      controls = animate(from, to, {
        type: 'spring',
        damping: 60,
        stiffness: 100,
        restDelta: 0.001,
        restSpeed: 0.01,
        onUpdate: (latest) => {
          if (elementRef) {
            elementRef.textContent = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
            }).format(Number(latest.toFixed(decimalPlaces)))
          }
        },
      })
    }, local.delay * 1000)

    onCleanup(() => {
      clearTimeout(timer)
      controls?.stop()
    })
  })

  return (
    <span
      ref={elementRef}
      class={cn(
        `
          inline-block tracking-wider text-black tabular-nums
          dark:text-white
        `,
        local.class,
      )}
      {...rest}
    >
      {local.startValue}
    </span>
  )
}
