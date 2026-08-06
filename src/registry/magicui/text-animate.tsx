import type { TargetAndTransition, Transition, ValueTransition, Variant, Variants } from 'motion'
import type { JSX, ValidComponent } from 'solid-js'
import { animate } from 'motion'
import { createEffect, For, mergeProps, onCleanup, Show, splitProps, untrack } from 'solid-js'
import { Dynamic } from 'solid-js/web'
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
  const merged = mergeProps(
    {
      delay: 0,
      duration: 0.3,
      as: 'p',
      startOnView: true,
      once: false,
      by: 'word',
      animation: 'fadeIn',
      accessible: true,
    } as const,
    props,
  )
  const [local, rest] = splitProps(merged, [
    'children',
    'class',
    'segmentClassName',
    'delay',
    'duration',
    'variants',
    'as',
    'by',
    'startOnView',
    'once',
    'animation',
    'accessible',
  ])

  const segments = () => {
    switch (local.by) {
      case 'word':
        return local.children.split(/(\s+)/)
      case 'character':
        return local.children.split('')
      case 'line':
        return local.children.split('\n')
      case 'text':
      default:
        return [local.children]
    }
  }

  const finalVariants = () => {
    const variantCount = segments().length
    if (local.variants) {
      return {
        container: {
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              opacity: { duration: 0.01, delay: local.delay },
              delayChildren: local.delay,
              staggerChildren: local.duration / variantCount,
            },
          },
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: local.duration / variantCount,
              staggerDirection: -1,
            },
          },
        },
        item: local.variants,
      }
    }
    if (local.animation) {
      const preset = defaultItemAnimationVariants[local.animation]
      return {
        container: {
          ...preset.container,
          show: {
            ...preset.container.show,
            transition: {
              delayChildren: local.delay,
              staggerChildren: local.duration / variantCount,
            },
          },
          exit: {
            ...preset.container.exit,
            transition: {
              staggerChildren: local.duration / variantCount,
              staggerDirection: -1,
            },
          },
        },
        item: preset.item,
      }
    }
    return { container: defaultContainerVariants, item: defaultItemVariants }
  }

  let containerRef: HTMLElement | undefined
  const spanRefs: HTMLElement[] = []
  const isInView = createInView(() => containerRef, { once: untrack(() => local.once) })

  const showAnimation = () => {
    const fv = finalVariants()
    const stagger = local.duration / segments().length

    if (containerRef) {
      const show = resolveVariant(fv.container.show, 0)
      if (show) {
        const { transition, ...target } = show
        const { delay: tDelay, ...opts } = transition ?? {}
        animate(containerRef, target, { ...opts, delay: local.delay, duration: 0.01 })
      }
    }

    spanRefs.forEach((span, i) => {
      if (!span)
        return
      const custom = i * staggerTimings[local.by]
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
      const totalDelay = local.delay + i * stagger + innerDelay
      animate(span, keyframes, withDelay(opts, totalDelay))
    })
  }

  const hideAnimation = () => {
    const fv = finalVariants()
    for (let i = 0; i < spanRefs.length; i++) {
      const span = spanRefs[i]
      if (!span)
        continue
      const custom = i * staggerTimings[local.by]
      const hidden = resolveVariant(fv.item.hidden, custom)
      if (hidden)
        animate(span, hidden, { duration: 0 })
    }
  }

  createEffect(() => {
    if (local.startOnView) {
      if (isInView()) {
        showAnimation()
      }
      else {
        hideAnimation()
      }
    }
    else {
      showAnimation()
    }
  })

  onCleanup(() => {
    if (containerRef)
      animate(containerRef, { opacity: 1 }, { duration: 0 })
  })

  return (
    <Dynamic
      component={local.as}
      ref={containerRef}
      class={cn('whitespace-pre-wrap', local.class)}
      aria-label={local.accessible ? local.children : undefined}
      {...rest}
    >
      <Show when={local.accessible}>
        <span class="sr-only">{local.children}</span>
      </Show>
      <For each={segments()}>
        {(segment, i) => (
          <span
            ref={(el) => {
              spanRefs[i()] = el
            }}
            class={cn(
              local.by === 'line' ? 'block' : 'inline-block whitespace-pre',
              local.by === 'character' && '',
              local.segmentClassName,
            )}
            aria-hidden={local.accessible ? true : undefined}
          >
            {segment}
          </span>
        )}
      </For>
    </Dynamic>
  )
}
