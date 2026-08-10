import type { AnimationPlaybackControls } from 'motion'
import type { JSX } from 'solid-js'
import { animate } from 'motion'
import {
  createEffect,
  createSignal,
  createUniqueId,
  For,
  mergeProps,
  on,
  onCleanup,
  splitProps,
  untrack,
} from 'solid-js'
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

  createEffect(
    on(() => props.square, () => {
      if (!rectRef)
        return

      animation?.stop()
      animation = animate(
        rectRef,
        { opacity: [0, props.maxOpacity] },
        {
          duration: props.duration,
          repeat: 1,
          delay: props.delay,
          repeatType: 'reverse',
          repeatDelay: props.repeatDelay,
        },
      )
      const squareId = props.square.id
      const onComplete = props.onComplete
      animation.finished.then(
        () => onComplete(squareId),
        () => {},
      )
    }),
  )

  onCleanup(() => animation?.stop())

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
  const merged = mergeProps(
    {
      width: 40,
      height: 40,
      x: -1,
      y: -1,
      strokeDasharray: 0,
      numSquares: 50,
      maxOpacity: 0.5,
      duration: 4,
      repeatDelay: 0.5,
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'width',
    'height',
    'x',
    'y',
    'strokeDasharray',
    'numSquares',
    'maxOpacity',
    'duration',
    'repeatDelay',
    'class',
  ])
  const id = createUniqueId()
  let containerRef: SVGSVGElement | undefined
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 })
  const [squares, setSquares] = createSignal<Array<Square>>([])

  const getPos = (): [number, number] => {
    return [
      Math.floor((Math.random() * dimensions().width) / local.width),
      Math.floor((Math.random() * dimensions().height) / local.height),
    ]
  }

  const generateSquares = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: untrack(getPos),
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
        pos: getPos(),
        iteration: current.iteration + 1,
      }

      return nextSquares
    })
  }

  createEffect(() => {
    if (dimensions().width && dimensions().height) {
      setSquares(generateSquares(local.numSquares))
    }
  })

  createEffect(() => {
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

    onCleanup(() => {
      resizeObserver?.disconnect()
    })
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
        local.class,
      )}
      {...rest}
    >
      <defs>
        <pattern
          id={id}
          width={local.width}
          height={local.height}
          patternUnits="userSpaceOnUse"
          x={local.x}
          y={local.y}
        >
          <path
            d={`M.5 ${local.height}V.5H${local.width}`}
            fill="none"
            stroke-dasharray={String(local.strokeDasharray)}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={local.x} y={local.y} class="overflow-visible">
        <For each={squares()}>
          {(square, index) => (
            <AnimatedSquare
              square={square}
              width={local.width}
              height={local.height}
              maxOpacity={local.maxOpacity}
              duration={local.duration}
              repeatDelay={local.repeatDelay}
              delay={index() * 0.1}
              onComplete={updateSquarePosition}
            />
          )}
        </For>
      </svg>
    </svg>
  )
}
