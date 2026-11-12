import type { JSX } from '@solidjs/web'
import type { AnimationPlaybackControls } from 'motion'

import { animate } from 'motion'
import { createEffect, createSignal, createUniqueId, For, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

export interface AnimatedGridPatternProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: number
  numSquares?: number
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
}

interface Square {
  id: number
  pos: [number, number]
  iteration: number
}

function AnimatedSquare(props: {
  square: Square
  width: number
  height: number
  maxOpacity: number
  duration: number
  repeatDelay: number
  delay: number
  onComplete: (squareId: number) => void
}) {
  let rectRef: SVGRectElement | undefined
  let animation: AnimationPlaybackControls | undefined

  // Read every dependency in compute: apply is untracked, so reading props
  // there would only see the first snapshot.
  createEffect(
    () => ({
      square: props.square,
      maxOpacity: props.maxOpacity,
      duration: props.duration,
      delay: props.delay,
      repeatDelay: props.repeatDelay,
    }),
    ({ square, maxOpacity, duration, delay, repeatDelay }) => {
      if (!rectRef)
        return

      animation?.stop()
      animation = animate(
        rectRef,
        { opacity: [0, maxOpacity] },
        {
          duration,
          repeat: 1,
          delay,
          repeatType: 'reverse',
          repeatDelay,
        },
      )
      const onComplete = props.onComplete
      animation.finished.then(
        () => onComplete(square.id),
        () => {},
      )
    },
  )

  onSettled(() => {
    return () => animation?.stop()
  })

  return (
    <rect
      ref={rectRef}
      width={props.width - 1}
      height={props.height - 1}
      x={props.square.pos[0] * props.width + 1}
      y={props.square.pos[1] * props.height + 1}
      fill="currentColor"
      stroke-width="0"
      opacity={0}
    />
  )
}

export function AnimatedGridPattern(props: AnimatedGridPatternProps) {
  const rest = omit(props, 'width', 'height', 'x', 'y', 'strokeDasharray', 'numSquares', 'maxOpacity', 'duration', 'repeatDelay', 'class')
  const numSquares = () => props.numSquares ?? 50
  const strokeDasharray = () => props.strokeDasharray ?? 0
  const id = createUniqueId()
  let containerRef: SVGSVGElement | undefined
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 })
  const [squares, setSquares] = createSignal<Array<Square>>([])

  const getPos = (size: { width: number, height: number }): [number, number] => {
    return [
      Math.floor((Math.random() * size.width) / (props.width ?? 40)),
      Math.floor((Math.random() * size.height) / (props.height ?? 40)),
    ]
  }

  const generateSquares = (count: number, size: { width: number, height: number }) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(size),
      iteration: 0,
    }))
  }

  const updateSquarePosition = (squareId: number) => {
    setSquares((currentSquares) => {
      const current = currentSquares[squareId]
      if (!current || current.id !== squareId) {
        return currentSquares
      }

      const nextSquares = currentSquares.slice()
      nextSquares[squareId] = {
        ...current,
        pos: getPos(dimensions()),
        iteration: current.iteration + 1,
      }

      return nextSquares
    })
  }

  createEffect(() => [dimensions(), numSquares()], ([dimensions, numSquares]) => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares, dimensions))
    }
  })

  onSettled(() => {
    const element = containerRef
    let resizeObserver: ResizeObserver | null = null

    if (element) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setDimensions((currentDimensions) => {
            const nextWidth = entry.contentRect.width
            const nextHeight = entry.contentRect.height
            if (
              currentDimensions.width === nextWidth
              && currentDimensions.height === nextHeight
            ) {
              return currentDimensions
            }
            return { width: nextWidth, height: nextHeight }
          })
        }
      })

      resizeObserver.observe(element)
    }

    return () => {
      resizeObserver?.disconnect()
    }
  })

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      class={cn(
        `
          pointer-events-none absolute inset-0 size-full fill-gray-400/30
          stroke-gray-400/30
        `,
        props.class,
      )}
      {...rest}
    >
      <defs>
        <pattern
          id={id}
          width={(props.width ?? 40)}
          height={(props.height ?? 40)}
          patternUnits="userSpaceOnUse"
          x={(props.x ?? -1)}
          y={(props.y ?? -1)}
        >
          <path
            d={`M.5 ${(props.height ?? 40)}V.5H${(props.width ?? 40)}`}
            fill="none"
            stroke-dasharray={String(strokeDasharray())}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={(props.x ?? -1)} y={(props.y ?? -1)} class="overflow-visible">
        <For each={squares()}>
          {(square, index) => (
            <AnimatedSquare
              square={square}
              width={(props.width ?? 40)}
              height={(props.height ?? 40)}
              maxOpacity={(props.maxOpacity ?? 0.5)}
              duration={(props.duration ?? 4)}
              repeatDelay={(props.repeatDelay ?? 0.5)}
              delay={index() * 0.1}
              onComplete={updateSquarePosition}
            />
          )}
        </For>
      </svg>
    </svg>
  )
}
