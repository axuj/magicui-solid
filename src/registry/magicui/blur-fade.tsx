import type { JSX } from 'solid-js'
import { animate, inView } from 'motion'
import { createEffect, createSignal, mergeProps, onCleanup, splitProps } from 'solid-js'

type MarginType = NonNullable<Parameters<typeof inView>[2]>['margin']

interface VariantState {
  x?: number
  y?: number
  opacity?: number
  filter?: string
}

interface BlurFadeProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'style'> {
  children: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  variant?: {
    hidden: { y: number }
    visible: { y: number }
  }
  duration?: number
  delay?: number
  offset?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  inView?: boolean
  inViewMargin?: MarginType
  blur?: string
}

const getFilter = (v: VariantState) => v.filter

export function BlurFade(props: BlurFadeProps) {
  const merged = mergeProps(
    { duration: 0.4, delay: 0, offset: 6, direction: 'down', inView: false, inViewMargin: '-50px' as MarginType, blur: '6px' },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'children',
    'class',
    'variant',
    'duration',
    'delay',
    'offset',
    'direction',
    'inView',
    'inViewMargin',
    'blur',
    'style',
  ])

  let ref: HTMLDivElement | undefined
  const [hasEnteredView, setHasEnteredView] = createSignal(false)

  createEffect(() => {
    if (!ref)
      return
    const stopInView = inView(ref, () => {
      setHasEnteredView(true)
    }, {
      margin: local.inViewMargin,
      amount: 'some',
    })
    onCleanup(stopInView)
  })

  const defaultVariants = (): { hidden: VariantState, visible: VariantState } => {
    const axis = local.direction === 'left' || local.direction === 'right' ? 'x' : 'y'
    const offset = local.direction === 'right' || local.direction === 'down' ? -local.offset : local.offset
    return {
      hidden: { [axis]: offset, opacity: 0, filter: `blur(${local.blur})` },
      visible: { [axis]: 0, opacity: 1, filter: 'blur(0px)' },
    }
  }

  const combinedVariants = (): { hidden: VariantState, visible: VariantState } =>
    local.variant ?? defaultVariants()

  const hiddenFilter = () => getFilter(combinedVariants().hidden)
  const visibleFilter = () => getFilter(combinedVariants().visible)
  const shouldTransitionFilter = () => hiddenFilter() != null && visibleFilter() != null && hiddenFilter() !== visibleFilter()

  const initialStyle = () => {
    const hidden = combinedVariants().hidden
    const style: JSX.CSSProperties = {}
    if (hidden.opacity != null)
      style.opacity = hidden.opacity
    if (hidden.filter != null)
      style.filter = hidden.filter
    const transform: string[] = []
    if (hidden.x != null)
      transform.push(`translateX(${hidden.x}px)`)
    if (hidden.y != null)
      transform.push(`translateY(${hidden.y}px)`)
    if (transform.length > 0)
      style.transform = transform.join(' ')
    return style
  }

  const shouldAnimate = () => !local.inView || hasEnteredView()

  createEffect(() => {
    if (!ref || !shouldAnimate())
      return
    const animation = animate(ref, combinedVariants().visible as Record<string, string | number>, {
      delay: 0.04 + local.delay,
      duration: local.duration,
      ease: 'easeOut',
      ...(shouldTransitionFilter() ? { filter: { duration: local.duration } } : {}),
    })
    onCleanup(() => animation.stop())
  })

  return (
    <div
      ref={ref}
      class={local.class}
      style={{ ...initialStyle(), ...local.style }}
      {...rest}
    >
      {local.children}
    </div>
  )
}
