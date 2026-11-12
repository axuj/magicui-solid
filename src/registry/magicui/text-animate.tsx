import type { JSX, ValidComponent } from '@solidjs/web'
import type { TargetAndTransition, Transition, ValueTransition, Variant, Variants } from 'motion'

import { Dynamic } from '@solidjs/web'
import { animate } from 'motion'

import { createEffect, createSignal, For, omit, onSettled, Show, untrack } from 'solid-js'

import { createInView } from '@/lib/create-in-view'
import { cn } from '@/lib/utils'

function isValueTransition(value: unknown): value is ValueTransition {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function withDelay(transition: Transition | undefined, delay: number): Transition {
  const result: Record<string, unknown> = { delay }
  for (const [key, value] of Object.entries(transition ?? {})) {
    result[key] = isValueTransition(value) ? { ...value, delay } : value
  }
  return result as Transition
}

type AnimationType = 'text' | 'word' | 'character' | 'line'
type AnimationVariant
  = | 'fadeIn'
    | 'blurIn'
    | 'blurInUp'
    | 'blurInDown'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'scaleUp'
    | 'scaleDown'

interface TextAnimateProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * The text content to animate
   */
  children: string
  /**
   * The class name to be applied to each segment
   */
  segmentClassName?: string
  /**
   * The delay before the animation starts
   */
  delay?: number
  /**
   * The duration of the animation
   */
  duration?: number
  /**
   * Custom motion variants for the animation
   */
  variants?: Variants
  /**
   * The element type to render
   */
  as?: ValidComponent
  /**
   * How to split the text ("text", "word", "character")
   */
  by?: AnimationType
  /**
   * Whether to start animation when component enters viewport
   */
  startOnView?: boolean
  /**
   * Whether to animate only once
   */
  once?: boolean
  /**
   * The animation preset to use
   */
  animation?: AnimationVariant
  /**
   * Whether to enable accessibility features (default: true)
   */
  accessible?: boolean
}

const staggerTimings: Record<AnimationType, number> = {
  text: 0.06,
  word: 0.05,
  character: 0.03,
  line: 0.06,
}

const defaultContainerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const defaultItemVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
}

const defaultItemAnimationVariants: Record<
  AnimationVariant,
  { container: typeof defaultContainerVariants, item: Variants }
> = {
  fadeIn: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
      },
      exit: {
        opacity: 0,
        y: 20,
        transition: { duration: 0.3 },
      },
    },
  },
  blurIn: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      show: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.3 },
      },
      exit: {
        opacity: 0,
        filter: 'blur(10px)',
        transition: { duration: 0.3 },
      },
    },
  },
  blurInUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(10px)', y: 20 },
      show: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
          y: { duration: 0.3 },
          opacity: { duration: 0.4 },
          filter: { duration: 0.3 },
        },
      },
      exit: {
        opacity: 0,
        filter: 'blur(10px)',
        y: 20,
        transition: {
          y: { duration: 0.3 },
          opacity: { duration: 0.4 },
          filter: { duration: 0.3 },
        },
      },
    },
  },
  blurInDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: 'blur(10px)', y: -20 },
      show: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
          y: { duration: 0.3 },
          opacity: { duration: 0.4 },
          filter: { duration: 0.3 },
        },
      },
      exit: {
        opacity: 0,
        filter: 'blur(10px)',
        y: -20,
        transition: {
          y: { duration: 0.3 },
          opacity: { duration: 0.4 },
          filter: { duration: 0.3 },
        },
      },
    },
  },
  slideUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { y: 20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      },
      exit: {
        y: -20,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  slideDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { y: -20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      },
      exit: {
        y: 20,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  slideLeft: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: 20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      },
      exit: {
        x: -20,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  slideRight: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: -20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3 },
      },
      exit: {
        x: 20,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  scaleUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { scale: 0.5, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.3,
          scale: {
            type: 'spring',
            damping: 15,
            stiffness: 300,
          },
        },
      },
      exit: {
        scale: 0.5,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
  scaleDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { scale: 1.5, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.3,
          scale: {
            type: 'spring',
            damping: 15,
            stiffness: 300,
          },
        },
      },
      exit: {
        scale: 1.5,
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },
}

function resolveVariant(
  variant: Variant | undefined,
  custom: number,
): TargetAndTransition | undefined {
  if (typeof variant === 'function') {
    const target = variant(custom, {}, {})
    if (typeof target === 'string')
      return undefined
    return target
  }
  return variant
}

export function TextAnimate(props: TextAnimateProps) {
  const rest = omit(props, 'children', 'class', 'segmentClassName', 'delay', 'duration', 'variants', 'as', 'by', 'startOnView', 'once', 'animation', 'accessible')
  const accessible = () => props.accessible ?? true
  const animation = () => props.animation ?? 'fadeIn'
  const by = () => props.by ?? 'word'
  const startOnView = () => props.startOnView ?? true

  const segments = () => {
    switch (by()) {
      case 'word':
        return props.children.split(/(\s+)/)
      case 'character':
        return props.children.split('')
      case 'line':
        return props.children.split('\n')
      case 'text':
      default:
        return [props.children]
    }
  }

  const finalVariants = () => {
    const variantCount = segments().length
    if (props.variants) {
      return {
        container: {
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              opacity: { duration: 0.01, delay: (props.delay ?? 0) },
              delayChildren: (props.delay ?? 0),
              staggerChildren: (props.duration ?? 0.3) / variantCount,
            },
          },
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: (props.duration ?? 0.3) / variantCount,
              staggerDirection: -1,
            },
          },
        },
        item: props.variants,
      }
    }
    if (animation()) {
      const preset = defaultItemAnimationVariants[animation()]
      return {
        container: {
          ...preset.container,
          show: {
            ...preset.container.show,
            transition: {
              delayChildren: (props.delay ?? 0),
              staggerChildren: (props.duration ?? 0.3) / variantCount,
            },
          },
          exit: {
            ...preset.container.exit,
            transition: {
              staggerChildren: (props.duration ?? 0.3) / variantCount,
              staggerDirection: -1,
            },
          },
        },
        item: preset.item,
      }
    }
    return { container: defaultContainerVariants, item: defaultItemVariants }
  }

  const [containerRef, setContainerRef] = createSignal<HTMLElement>()
  const spanRefs: HTMLElement[] = []
  const isInView = createInView(containerRef, { once: () => props.once ?? false })

  const showAnimation = (snapshot: {
    finalVariants: ReturnType<typeof finalVariants>
    segments: string[]
    by: AnimationType
    delay?: number
    duration?: number
    containerRef: HTMLElement | undefined
  }) => {
    const { finalVariants: fv, segments, by, delay, duration, containerRef } = snapshot
    const stagger = (duration ?? 0.3) / segments.length

    const el = containerRef
    if (el) {
      const show = resolveVariant(fv.container.show, 0)
      if (show) {
        const { transition, ...target } = show
        const { delay: tDelay, ...opts } = transition ?? {}
        animate(el, target, { ...opts, delay: (delay ?? 0), duration: 0.01 })
      }
    }

    spanRefs.forEach((span, i) => {
      if (!span)
        return
      const custom = i * staggerTimings[by]
      const hidden = resolveVariant(fv.item.hidden, custom)
      const show = resolveVariant(fv.item.show, custom)
      if (!show)
        return
      const { transition, ...target } = show
      const { delay: innerDelay = 0, ...opts } = transition ?? {}
      const keyframes: Record<string, unknown> = {}
      for (const key in target) {
        const k = key as keyof typeof target
        const from = hidden?.[k]
        const to = target[k]
        if (to !== undefined)
          keyframes[key] = from !== undefined ? [from, to] : to
      }
      const totalDelay = (delay ?? 0) + i * stagger + innerDelay
      animate(span, keyframes, withDelay(opts, totalDelay))
    })
  }

  const hideAnimation = (snapshot: {
    finalVariants: ReturnType<typeof finalVariants>
    by: AnimationType
  }) => {
    const { finalVariants: fv, by } = snapshot
    for (let i = 0; i < spanRefs.length; i++) {
      const span = spanRefs[i]
      if (!span)
        continue
      const custom = i * staggerTimings[by]
      const hidden = resolveVariant(fv.item.hidden, custom)
      if (hidden)
        animate(span, hidden, { duration: 0 })
    }
  }

  createEffect(
    () => ({
      startOnView: startOnView(),
      isInView: isInView(),
      finalVariants: finalVariants(),
      segments: segments(),
      by: by(),
      delay: props.delay,
      duration: props.duration,
      variants: props.variants,
      animation: animation(),
      children: props.children,
      containerRef: containerRef(),
    }),
    ({ startOnView, isInView, finalVariants, segments, by, delay, duration, containerRef }) => {
      if (startOnView) {
        if (isInView) {
          showAnimation({ finalVariants, segments, by, delay, duration, containerRef })
        }
        else {
          hideAnimation({ finalVariants, by })
        }
      }
      else {
        showAnimation({ finalVariants, segments, by, delay, duration, containerRef })
      }
    },
  )

  onSettled(() => {
    return () => {
      const el = containerRef()
      if (el)
        animate(el, { opacity: 1 }, { duration: 0 })
    }
  })

  return (
    <Dynamic
      component={(props.as ?? 'p')}
      ref={setContainerRef}
      class={cn('whitespace-pre-wrap', props.class)}
      aria-label={accessible() ? props.children : undefined}
      {...rest}
    >
      <Show when={accessible()}>
        <span class="sr-only">{props.children}</span>
      </Show>
      <For each={segments()}>
        {(segment, i) => (
          <span
            ref={(el) => {
              spanRefs[untrack(i)] = el
            }}
            class={cn(
              by() === 'line' ? 'block' : 'inline-block whitespace-pre',
              by() === 'character' && '',
              props.segmentClassName,
            )}
            aria-hidden={accessible() ? 'true' : undefined}
          >
            {segment}
          </span>
        )}
      </For>
    </Dynamic>
  )
}
