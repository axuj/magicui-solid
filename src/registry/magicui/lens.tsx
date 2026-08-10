import type { JSX } from 'solid-js'
import { animate } from 'motion'
import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  Show,
  untrack,
} from 'solid-js'

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
  const merged = mergeProps(
    {
      zoomFactor: 1.3,
      lensSize: 170,
      isStatic: false,
      position: { x: 0, y: 0 },
      duration: 0.1,
      lensColor: 'black',
      ariaLabel: 'Zoom Area',
    },
    props,
  )

  createEffect(() => {
    if (merged.zoomFactor < 1) {
      throw new Error('zoomFactor must be greater than 1')
    }
    if (merged.lensSize < 0) {
      throw new Error('lensSize must be greater than 0')
    }
  })

  const [isHovering, setIsHovering] = createSignal(false)
  const [mousePosition, setMousePosition] = createSignal<Position>(untrack(() => merged.position))
  const [isMounted, setIsMounted] = createSignal(false)
  const [isExiting, setIsExiting] = createSignal(false)

  const currentPosition = createMemo(() => {
    if (merged.isStatic)
      return merged.position
    if (merged.defaultPosition && !isHovering())
      return merged.defaultPosition
    return mousePosition()
  })

  const maskImage = () =>
    `radial-gradient(circle ${merged.lensSize / 2}px at ${currentPosition().x}px ${currentPosition().y}px, ${merged.lensColor} 100%, transparent 100%)`

  createEffect(() => {
    if (merged.isStatic || merged.defaultPosition) {
      setIsMounted(true)
      return
    }
    if (isHovering()) {
      setIsExiting(false)
      setIsMounted(true)
    }
    else {
      setIsExiting(true)
    }
  })

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
      aria-label={merged.ariaLabel}
      tabIndex={0}
    >
      {merged.children}
      <Show when={isMounted()}>
        <LensContent
          maskImage={maskImage()}
          x={currentPosition().x}
          y={currentPosition().y}
          zoomFactor={merged.zoomFactor}
          duration={merged.duration}
          isExiting={isExiting()}
          onExitComplete={() => setIsMounted(false)}
        >
          {merged.children}
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

  createEffect(() => {
    if (!el)
      return
    const exiting = props.isExiting
    const anim = exiting
      ? animate(el, { opacity: 0, scale: 0.8 }, { duration: props.duration, onComplete: () => props.onExitComplete() })
      : animate(el, { opacity: [0, 1], scale: [0.58, 1] }, { duration: props.duration })
    onCleanup(() => anim.stop())
  })

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
