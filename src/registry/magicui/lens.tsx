import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'

interface Position {
  /** The x coordinate of the lens */
  x: number
  /** The y coordinate of the lens */
  y: number
}

interface LensProps {
  /** The children of the lens */
  children: JSX.Element
  /** The zoom factor of the lens */
  zoomFactor?: number
  /** The size of the lens */
  lensSize?: number
  /** The position of the lens */
  position?: Position
  /** The default position of the lens */
  defaultPosition?: Position
  /** Whether the lens is static */
  isStatic?: boolean
  /** The duration of the animation */
  duration?: number
  /** The color of the lens */
  lensColor?: string
  /** The aria label of the lens */
  ariaLabel?: string
}

export function Lens(props: LensProps) {
  const ariaLabel = () => props.ariaLabel ?? 'Zoom Area'
  const isStatic = () => props.isStatic ?? false
  const lensColor = () => props.lensColor ?? 'black'
  const lensSize = () => props.lensSize ?? 170
  const position = () => props.position ?? { x: 0, y: 0 }

  createEffect(
    () => ({ zoomFactor: props.zoomFactor, lensSize: lensSize() }),
    ({ zoomFactor, lensSize }) => {
      if ((zoomFactor ?? 1.3) < 1) {
        throw new Error('zoomFactor must be greater than 1')
      }
      if (lensSize < 0) {
        throw new Error('lensSize must be greater than 0')
      }
    },
  )

  const [isHovering, setIsHovering] = createSignal(false)
  const [mousePosition, setMousePosition] = createSignal<Position>(position())
  const [isMounted, setIsMounted] = createSignal(false)
  const [isExiting, setIsExiting] = createSignal(false)

  const currentPosition = createMemo(() => {
    if (isStatic())
      return position()
    if (props.defaultPosition && !isHovering())
      return props.defaultPosition
    return mousePosition()
  })

  const maskImage = () =>
    `radial-gradient(circle ${lensSize() / 2}px at ${currentPosition().x}px ${currentPosition().y}px, ${lensColor()} 100%, transparent 100%)`

  createEffect(
    () => ({ isStatic: isStatic(), defaultPosition: props.defaultPosition, isHovering: isHovering() }),
    ({ isStatic, defaultPosition, isHovering }) => {
      if (isStatic || defaultPosition) {
        setIsMounted(true)
        return
      }
      if (isHovering) {
        setIsExiting(false)
        setIsMounted(true)
      }
      else {
        setIsExiting(true)
      }
    },
  )

  function handleMouseMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      class="relative z-20 overflow-hidden rounded-xl"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onKeyDown={(e) => {
        if (e.key === 'Escape')
          setIsHovering(false)
      }}
      role="region"
      aria-label={ariaLabel()}
      tabindex={0}
    >
      {props.children}
      <Show when={isMounted()}>
        <LensContent
          maskImage={maskImage()}
          x={currentPosition().x}
          y={currentPosition().y}
          zoomFactor={(props.zoomFactor ?? 1.3)}
          duration={(props.duration ?? 0.1)}
          isExiting={isExiting()}
          onExitComplete={() => setIsMounted(false)}
        >
          {props.children}
        </LensContent>
      </Show>
    </div>
  )
}

function LensContent(props: {
  children: JSX.Element
  maskImage: string
  x: number
  y: number
  zoomFactor: number
  duration: number
  isExiting: boolean
  onExitComplete: () => void
}) {
  let el: HTMLDivElement | undefined

  createEffect(
    () => ({ isExiting: props.isExiting, duration: props.duration }),
    ({ isExiting, duration }) => {
      if (!el)
        return
      const exiting = isExiting
      const anim = exiting
        ? animate(el, { opacity: 0, scale: 0.8 }, { duration, onComplete: () => props.onExitComplete() })
        : animate(el, { opacity: [0, 1], scale: [0.58, 1] }, { duration })
      return () => anim.stop()
    },
  )

  return (
    <div
      ref={el}
      class="absolute inset-0 overflow-hidden"
      style={{
        'mask-image': props.maskImage,
        '-webkit-mask-image': props.maskImage,
        'transform-origin': `${props.x}px ${props.y}px`,
        'z-index': 50,
      }}
    >
      <div
        class="absolute inset-0"
        style={{
          'transform': `scale(${props.zoomFactor})`,
          'transform-origin': `${props.x}px ${props.y}px`,
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
