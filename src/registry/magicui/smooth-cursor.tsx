import type { SpringOptions } from '@solid-primitives/spring'
import type { JSX } from 'solid-js'
import { createSpring } from '@solid-primitives/spring'
import { createEffect, createSignal, mergeProps, onCleanup, onMount, untrack } from 'solid-js'

interface Position {
  x: number
  y: number
  [key: string]: number
}

export interface SmoothCursorProps {
  cursor?: JSX.Element
  springConfig?: {
    damping: number
    stiffness: number
    mass: number
    restDelta: number
  }
}

const DESKTOP_POINTER_QUERY = '(any-hover: hover) and (any-pointer: fine)'

function isTrackablePointer(pointerType: string) {
  return pointerType !== 'touch'
}

function DefaultCursorSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      style={{ scale: '0.5', filter: 'drop-shadow(0px 2.26px 2.26px rgba(0,0,0,0.08))' }}
    >
      <path
        d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
        fill="black"
      />
      <path
        d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
        stroke="white"
        stroke-width={2.25825}
      />
    </svg>
  )
}

type SpringConfig = NonNullable<SmoothCursorProps['springConfig']>

// framer-motion 量纲（stiffness/mass/restDelta，每帧离散积分）→ @solid-primitives/spring 归一化量纲
function toSpringOptions(config: SpringConfig): SpringOptions {
  return {
    stiffness: config.stiffness / (config.mass * 60 * 60),
    damping: config.damping / 60,
    precision: config.restDelta,
  }
}

export function SmoothCursor(props: SmoothCursorProps) {
  const merged = mergeProps({ cursor: <DefaultCursorSVG /> }, props)

  const lastMousePos = { x: 0, y: 0 }
  const velocity = { x: 0, y: 0 }
  let lastUpdateTime = Date.now()
  let previousAngle = 0
  let accumulatedRotation = 0

  const [isEnabled, setIsEnabled] = createSignal(false)
  const [isVisible, setIsVisible] = createSignal(false)

  const springConfig = untrack(() => props.springConfig) ?? {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  }
  const [position, setPosition] = createSpring<Position>(
    { x: 0, y: 0 },
    toSpringOptions(springConfig),
  )
  const [rotation, setRotation] = createSpring(
    0,
    toSpringOptions({ ...springConfig, damping: 60, stiffness: 300 }),
  )
  const [scale, setScale] = createSpring(
    1,
    toSpringOptions({ ...springConfig, stiffness: 500, damping: 35 }),
  )

  onMount(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY)

    const updateEnabled = () => {
      const nextIsEnabled = mediaQuery.matches
      setIsEnabled(nextIsEnabled)

      if (!nextIsEnabled) {
        setIsVisible(false)
      }
    }

    updateEnabled()
    mediaQuery.addEventListener('change', updateEnabled)

    onCleanup(() => {
      mediaQuery.removeEventListener('change', updateEnabled)
    })
  })

  createEffect(() => {
    if (!isEnabled()) {
      return
    }

    let timeout: ReturnType<typeof setTimeout> | null = null

    const updateVelocity = (currentPos: Position) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastUpdateTime

      if (deltaTime > 0) {
        velocity.x = (currentPos.x - lastMousePos.x) / deltaTime
        velocity.y = (currentPos.y - lastMousePos.y) / deltaTime
      }

      lastUpdateTime = currentTime
      lastMousePos.x = currentPos.x
      lastMousePos.y = currentPos.y
    }

    const smoothPointerMove = (e: PointerEvent) => {
      if (!isTrackablePointer(e.pointerType)) {
        return
      }

      setIsVisible(true)

      const currentPos = { x: e.clientX, y: e.clientY }
      updateVelocity(currentPos)

      const speed = Math.sqrt(
        velocity.x ** 2 + velocity.y ** 2,
      )

      setPosition(currentPos)

      if (speed > 0.1) {
        const currentAngle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI) + 90

        let angleDiff = currentAngle - previousAngle
        if (angleDiff > 180)
          angleDiff -= 360
        if (angleDiff < -180)
          angleDiff += 360
        accumulatedRotation += angleDiff
        setRotation(accumulatedRotation)
        previousAngle = currentAngle

        setScale(0.95)

        if (timeout !== null) {
          clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
          setScale(1)
        }, 150)
      }
    }

    let rafId = 0
    const throttledPointerMove = (e: PointerEvent) => {
      if (!isTrackablePointer(e.pointerType)) {
        return
      }

      if (rafId)
        return

      rafId = requestAnimationFrame(() => {
        smoothPointerMove(e)
        rafId = 0
      })
    }

    document.body.style.cursor = 'none'
    window.addEventListener('pointermove', throttledPointerMove, {
      passive: true,
    })

    onCleanup(() => {
      window.removeEventListener('pointermove', throttledPointerMove)
      document.body.style.cursor = 'auto'
      if (rafId)
        cancelAnimationFrame(rafId)
      if (timeout !== null) {
        clearTimeout(timeout)
      }
    })
  })

  return (
    <div
      style={{
        'position': 'fixed',
        'left': '0px',
        'top': '0px',
        'z-index': 100,
        'pointer-events': 'none',
        'will-change': 'transform',
        'display': isEnabled() ? 'block' : 'none',
        'opacity': isVisible() ? 1 : 0,
        'transition': 'opacity 0.15s',
        'transform': `translate3d(${position().x}px, ${position().y}px, 0) translate(-50%, -50%) rotate(${rotation()}deg) scale(${scale()})`,
      }}
    >
      {merged.cursor}
    </div>
  )
}
