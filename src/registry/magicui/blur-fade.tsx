import type { JSX } from '@solidjs/web'
import { animate, inView } from 'motion'
import { createEffect, createSignal, omit } from 'solid-js'

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
  const rest = omit(props, 'children', 'class', 'variant', 'duration', 'delay', 'offset', 'direction', 'inView', 'inViewMargin', 'blur', 'style')
  const blur = () => props.blur ?? '6px'
  const direction = () => props.direction ?? 'down'
  const inViewMargin = () => props.inViewMargin ?? '-50px' as MarginType

  let ref: HTMLDivElement | undefined
  const [hasEnteredView, setHasEnteredView] = createSignal(false)

  createEffect(() => [inViewMargin()], ([inViewMargin]) => {
    if (!ref)
      return
    const stopInView = inView(ref, () => {
      setHasEnteredView(true)
    }, {
      margin: inViewMargin,
      amount: 'some',
    })
    return (stopInView)
  })

  const defaultVariants = (
    directionValue = direction(),
    offsetValue = props.offset,
    blurValue = blur(),
  ): { hidden: VariantState, visible: VariantState } => {
    const axis = directionValue === 'left' || directionValue === 'right' ? 'x' : 'y'
    const offset = directionValue === 'right' || directionValue === 'down' ? -(offsetValue ?? 6) : (offsetValue ?? 6)
    return {
      hidden: { [axis]: offset, opacity: 0, filter: `blur(${blurValue})` },
      visible: { [axis]: 0, opacity: 1, filter: 'blur(0px)' },
    }
  }

  const combinedVariants = (
    variantValue = props.variant,
    directionValue = direction(),
    offsetValue = props.offset,
    blurValue = blur(),
  ): { hidden: VariantState, visible: VariantState } =>
    variantValue ?? defaultVariants(directionValue, offsetValue, blurValue)

  // Both filters are passed in by the caller, which reads them inside the
  // effect's compute; defaults here would silently capture them at setup.
  const shouldTransitionFilter = (
    hidden: string | null | undefined,
    visible: string | null | undefined,
  ) => hidden != null && visible != null && hidden !== visible

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

  const shouldAnimate = (inViewValue = props.inView, hasEnteredViewValue = hasEnteredView()) => !(inViewValue ?? false) || hasEnteredViewValue

  createEffect(() => [
    hasEnteredView(),
    props.inView,
    props.variant,
    direction(),
    props.offset,
    blur(),
    props.delay,
    props.duration,
  ], ([hasEnteredView, inView, variant, direction, offset, blur, delay, duration]) => {
    if (!ref || !shouldAnimate(inView, hasEnteredView))
      return
    const variants = combinedVariants(variant, direction, offset, blur)
    const animation = animate(ref, variants.visible as Record<string, string | number>, {
      delay: 0.04 + (delay ?? 0),
      duration: duration ?? 0.4,
      ease: 'easeOut',
      ...(shouldTransitionFilter(getFilter(variants.hidden), getFilter(variants.visible)) ? { filter: { duration: duration ?? 0.4 } } : {}),
    })
    return () => animation.stop()
  })

  return (
    <div
      ref={ref}
      class={props.class}
      style={{ ...initialStyle(), ...props.style }}
      {...rest}
    >
      {props.children}
    </div>
  )
}
