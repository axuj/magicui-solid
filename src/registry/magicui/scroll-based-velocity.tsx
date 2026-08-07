import type { MotionValue } from 'motion'
import type { JSX } from 'solid-js'
import { attachSpring, motionValue, scroll } from 'motion'
import { createContext, createEffect, createSignal, For, mergeProps, onCleanup, onMount, Show, splitProps, untrack, useContext } from 'solid-js'
import { cn } from '@/lib/utils'

interface ScrollVelocityRowProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Base scroll velocity percentage of content width
   */
  baseVelocity?: number
  /**
   * Scroll direction (1 = left-to-right, -1 = reverse)
   */
  direction?: 1 | -1
  /**
   * Toggles scroll interactivity
   */
  scrollReactivity?: boolean
}

export function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

const ScrollVelocityContext = createContext<MotionValue<number>>()

function createVelocityFactor(): MotionValue<number> {
  const rawVelocity = motionValue(0)
  const smoothVelocity = motionValue(0)
  const velocityFactor = motionValue(0)

  const updateFactor = () => {
    const v = smoothVelocity.get()
    const sign = v < 0 ? -1 : 1
    const magnitude = Math.min(5, (Math.abs(v) / 1000) * 5)
    velocityFactor.set(sign * magnitude)
  }

  const detachSpring = attachSpring(smoothVelocity, rawVelocity, { damping: 50, stiffness: 400 })
  const unsubscribeSmooth = smoothVelocity.on('change', updateFactor)

  let unsubscribeScroll: () => void = () => {}

  onMount(() => {
    unsubscribeScroll = scroll((_progress, info) => {
      rawVelocity.set(info.y.velocity)
    }, { axis: 'y' })
  })

  onCleanup(() => {
    unsubscribeScroll()
    detachSpring()
    unsubscribeSmooth()
  })

  return velocityFactor
}

export function ScrollVelocityContainer(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  const velocityFactor = createVelocityFactor()

  return (
    <ScrollVelocityContext.Provider value={velocityFactor}>
      <div class={cn('relative w-full', local.class)} {...rest}>
        {local.children}
      </div>
    </ScrollVelocityContext.Provider>
  )
}

export function ScrollVelocityRow(props: ScrollVelocityRowProps) {
  const sharedVelocityFactor = useContext(ScrollVelocityContext)
  return (
    <Show
      when={sharedVelocityFactor}
      fallback={<ScrollVelocityRowLocal {...props} />}
    >
      {factor => <ScrollVelocityRowImpl {...props} velocityFactor={factor()} />}
    </Show>
  )
}

interface ScrollVelocityRowImplProps extends ScrollVelocityRowProps {
  velocityFactor: MotionValue<number>
}

function ScrollVelocityRowImpl(props: ScrollVelocityRowImplProps) {
  const merged = mergeProps({ baseVelocity: 5, direction: 1, scrollReactivity: true }, props)
  const [local, rest] = splitProps(merged, [
    'children',
    'baseVelocity',
    'direction',
    'class',
    'scrollReactivity',
    'velocityFactor',
  ])

  let containerRef: HTMLDivElement | undefined
  let blockRef: HTMLDivElement | undefined
  const [numCopies, setNumCopies] = createSignal(1)
  const [xOffset, setXOffset] = createSignal('0px')

  const baseX = motionValue(0)
  const unitWidth = motionValue(0)

  const baseDirection = { current: untrack(() => local.direction) >= 0 ? 1 : -1 }
  const currentDirection = { current: untrack(() => local.direction) >= 0 ? 1 : -1 }
  const isInViewState = { current: true }
  const isPageVisible = { current: true }
  const prefersReducedMotion = { current: false }

  onMount(() => {
    const container = containerRef
    const block = blockRef
    if (!container || !block)
      return

    const updateSizes = () => {
      const containerWidth = container.offsetWidth || 0
      const blockWidth = block.scrollWidth || 0
      unitWidth.set(blockWidth)
      const nextCopies = blockWidth > 0 ? Math.max(3, Math.ceil(containerWidth / blockWidth) + 2) : 1
      setNumCopies(nextCopies)
    }

    updateSizes()

    const resizeObserver = new ResizeObserver(updateSizes)
    resizeObserver.observe(container)
    resizeObserver.observe(block)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInViewState.current = entry.isIntersecting
    })
    intersectionObserver.observe(container)

    const handleVisibility = () => {
      isPageVisible.current = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', handleVisibility, { passive: true })
    handleVisibility()

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleReducedMotion = () => {
      prefersReducedMotion.current = mediaQuery.matches
    }
    mediaQuery.addEventListener('change', handleReducedMotion)
    handleReducedMotion()

    onCleanup(() => {
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      mediaQuery.removeEventListener('change', handleReducedMotion)
    })
  })

  // Derived translate pixels from baseX wrapped into the unit width
  createEffect(() => {
    const updateX = () => {
      const width = Number(unitWidth.get()) || 1
      const offset = Number(baseX.get()) || 0
      setXOffset(`${-wrap(0, width, offset)}px`)
    }
    const unsubscribeBase = baseX.on('change', updateX)
    const unsubscribeWidth = unitWidth.on('change', updateX)
    onCleanup(() => {
      unsubscribeBase()
      unsubscribeWidth()
    })
  })

  // Animation frame loop: move by base velocity combined with scroll velocity
  createEffect(() => {
    let rafId = 0
    let previousTime = performance.now()

    const loop = (time: number) => {
      const delta = time - previousTime
      previousTime = time

      if (isInViewState.current && isPageVisible.current) {
        const dt = delta / 1000
        const vf = local.scrollReactivity ? local.velocityFactor.get() : 0
        const absVf = Math.min(5, Math.abs(vf))
        const speedMultiplier = prefersReducedMotion.current ? 1 : 1 + absVf

        if (absVf > 0.1) {
          const scrollDirection = vf >= 0 ? 1 : -1
          currentDirection.current = baseDirection.current * scrollDirection
        }

        const blockWidth = unitWidth.get() || 0
        if (blockWidth > 0) {
          const pixelsPerSecond = (blockWidth * local.baseVelocity) / 100
          const moveBy = currentDirection.current * pixelsPerSecond * speedMultiplier * dt
          baseX.set(baseX.get() + moveBy)
        }
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    onCleanup(() => cancelAnimationFrame(rafId))
  })

  return (
    <div
      ref={containerRef}
      class={cn('w-full overflow-hidden whitespace-nowrap', local.class)}
      {...rest}
    >
      <div
        class="
          inline-flex transform-gpu items-center will-change-transform
          select-none
        "
        style={{ transform: `translateX(${xOffset()})` }}
      >
        <For each={Array.from({ length: numCopies() })}>
          {(_, i) => (
            <div
              ref={(el) => {
                if (i() === 0)
                  blockRef = el
              }}
              aria-hidden={i() !== 0}
              class="inline-flex shrink-0 items-center"
            >
              {local.children}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

function ScrollVelocityRowLocal(props: ScrollVelocityRowProps) {
  const velocityFactor = createVelocityFactor()
  return <ScrollVelocityRowImpl {...props} velocityFactor={velocityFactor} />
}
