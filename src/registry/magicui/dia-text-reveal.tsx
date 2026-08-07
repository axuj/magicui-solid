import type { JSX } from 'solid-js'
import { animate } from 'motion'
import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  untrack,
} from 'solid-js'
import { createInView } from '@/lib/create-in-view'
import { cn } from '@/lib/utils'

const DEFAULT_COLORS = ['#c679c4', '#fa3d1d', '#ffb005', '#e1e1fe', '#0358f7']
const BAND_HALF = 17
const SWEEP_START = -BAND_HALF
const SWEEP_END = 100 + BAND_HALF

function sweepEase(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}

function buildGradient(pos: number, colors: string[], textColor: string) {
  const bandStart = pos - BAND_HALF
  const bandEnd = pos + BAND_HALF

  if (bandStart >= 100) {
    return `linear-gradient(90deg, ${textColor}, ${textColor})`
  }
  const n = colors.length
  const parts: string[] = []

  if (bandStart > 0)
    parts.push(`${textColor} 0%`, `${textColor} ${bandStart.toFixed(2)}%`)

  colors.forEach((c, i) => {
    const pct = n === 1 ? pos : bandStart + (i / (n - 1)) * BAND_HALF * 2
    parts.push(`${c} ${pct.toFixed(2)}%`)
  })

  if (bandEnd < 100)
    parts.push(`transparent ${bandEnd.toFixed(2)}%`, `transparent 100%`)

  return `linear-gradient(90deg, ${parts.join(', ')})`
}

function measureWidths(el: HTMLElement, texts: string[]) {
  const ghost = el.cloneNode() as HTMLElement
  Object.assign(ghost.style, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    width: 'auto',
    whiteSpace: 'nowrap',
  })
  el.parentElement!.appendChild(ghost)
  const widths = texts.map((t) => {
    ghost.textContent = t
    return ghost.getBoundingClientRect().width
  })
  ghost.remove()
  return widths
}

/**
 * Props for {@link DiaTextReveal}.
 */
export interface DiaTextRevealProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'children' | 'style'> {
  /**
   * Text to reveal. Pass multiple strings to rotate when {@link DiaTextRevealProps.repeat} is `true`.
   */
  text: string | string[]
  /**
   * Colors sampled across the moving gradient band. Defaults to a built-in palette.
   */
  colors?: string[]
  /**
   * CSS color for revealed text after the sweep and for leading/trailing regions during the animation.
   * @defaultValue `"var(--foreground)"`
   */
  textColor?: string
  /**
   * Duration of one sweep pass, in seconds.
   * @defaultValue `1.5`
   */
  duration?: number
  /**
   * Delay before the sweep starts, in seconds.
   * @defaultValue `0`
   */
  delay?: number
  /**
   * When `text` is an array, replay the sweep and advance to the next string after each completion.
   * @defaultValue `false`
   */
  repeat?: boolean
  /**
   * Pause between cycles when {@link DiaTextRevealProps.repeat} is `true`, in seconds.
   * @defaultValue `0.5`
   */
  repeatDelay?: number
  /**
   * If `true`, the animation starts only after the element enters the viewport.
   * @defaultValue `true`
   */
  startOnView?: boolean
  /**
   * Passed to `useInView`: if `true`, in-view detection fires at most once (no replay on scroll-back).
   * @defaultValue `true`
   */
  once?: boolean
  /**
   * Additional class names for the animated `span` (e.g. typography utilities).
   */
  class?: string
  /**
   * When `text` has multiple entries, use the widest string’s width for layout instead of animating width per line.
   * @defaultValue `false`
   */
  fixedWidth?: boolean
}

export function DiaTextReveal(props: DiaTextRevealProps) {
  const merged = mergeProps(
    {
      colors: DEFAULT_COLORS,
      textColor: 'var(--foreground)',
      duration: 1.5,
      delay: 0,
      repeat: false,
      repeatDelay: 0.5,
      startOnView: true,
      once: true,
      fixedWidth: false,
    } as const,
    props,
  )
  const [local, rest] = splitProps(merged, [
    'text',
    'colors',
    'textColor',
    'duration',
    'delay',
    'repeat',
    'repeatDelay',
    'startOnView',
    'once',
    'class',
    'fixedWidth',
  ])

  const texts = createMemo(() => (Array.isArray(local.text) ? local.text : [local.text]))
  const isMulti = createMemo(() => texts().length > 1)

  const [activeIndex, setActiveIndex] = createSignal(0)
  const [measuredWidths, setMeasuredWidths] = createSignal<number[]>([])
  const [sweepPos, setSweepPos] = createSignal(SWEEP_START)
  const [prefersReducedMotion, setPrefersReducedMotion] = createSignal(false)

  let spanEl: HTMLSpanElement | undefined
  let indexRef = 0
  let hasPlayed = false
  let timerRef: ReturnType<typeof setTimeout> | undefined
  let stopCurrent: (() => void) | null = null

  const isInView = createInView(() => spanEl, { amount: 0.1, once: untrack(() => local.once) })

  const backgroundImage = createMemo(() =>
    buildGradient(sweepPos(), local.colors, local.textColor),
  )

  createEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    onCleanup(() => mq.removeEventListener('change', update))
  })

  createEffect(() => {
    const el = spanEl
    if (!el || !isMulti())
      return
    setMeasuredWidths(measureWidths(el, texts()))
  })

  const play = () => {
    setSweepPos(SWEEP_START)
    const controls = animate(SWEEP_START, SWEEP_END, {
      duration: local.duration,
      delay: local.delay,
      ease: sweepEase,
      onUpdate: v => setSweepPos(v),
      onComplete() {
        if (!local.repeat)
          return
        timerRef = setTimeout(() => {
          const next = (indexRef + 1) % texts().length
          indexRef = next
          setActiveIndex(next)
          play()
        }, local.repeatDelay * 1000)
      },
    })
    stopCurrent = () => controls.stop()
  }

  createEffect(() => {
    if (prefersReducedMotion()) {
      setSweepPos(SWEEP_END)
      return
    }
    if (local.startOnView && !isInView())
      return
    if (local.once && hasPlayed)
      return
    hasPlayed = true
    play()
    onCleanup(() => {
      stopCurrent?.()
      clearTimeout(timerRef)
    })
  })

  const fixedW = createMemo(() => {
    const widths = measuredWidths()
    return isMulti() && local.fixedWidth && widths.length > 0 ? Math.max(...widths) : undefined
  })

  const animatedW = createMemo(() => {
    const widths = measuredWidths()
    return isMulti() && !local.fixedWidth && widths[activeIndex()] != null
      ? widths[activeIndex()]
      : undefined
  })

  createEffect(() => {
    const width = animatedW()
    if (width == null || !spanEl)
      return
    const controls = animate(spanEl, { width }, { duration: 0.4, ease: [0.4, 0, 0.2, 1] })
    onCleanup(() => controls.stop())
  })

  const multiStyle = createMemo(() => {
    if (!isMulti())
      return undefined
    return {
      'display': 'inline-block',
      'overflow': 'hidden',
      'white-space': 'nowrap',
      'vertical-align': 'text-center',
      ...(fixedW() != null ? { width: `${fixedW()}px` } : {}),
    } as const
  })

  return (
    <span
      ref={spanEl}
      class={cn('align-bottom leading-[100%] text-inherit', local.class)}
      style={{
        'transform': 'translateY(-2px)',
        'color': 'transparent',
        'background-clip': 'text',
        '-webkit-background-clip': 'text',
        'background-size': '100% 100%',
        'background-image': backgroundImage(),
        ...multiStyle(),
      }}
      {...rest}
    >
      {texts()[activeIndex()]}
    </span>
  )
}
