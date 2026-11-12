import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { createEffect, createSignal, For, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

interface SparkleData {
  id: string
  x: string
  y: string
  color: string
  delay: number
  scale: number
  lifespan: number
}

function Sparkle(props: SparkleData) {
  let ref: SVGSVGElement | undefined

  onSettled(() => {
    if (!ref)
      return
    const animation = animate(
      ref,
      {
        opacity: [0, 1, 0],
        scale: [0, props.scale, 0],
        rotate: [75, 120, 150],
      },
      {
        duration: 0.8,
        repeat: Infinity,
        delay: props.delay,
      },
    )
    return () => animation.stop()
  })

  return (
    <svg
      ref={ref}
      class="pointer-events-none absolute z-20"
      style={{ left: props.x, top: props.y, opacity: 0 }}
      width="21"
      height="21"
      viewBox="0 0 21 21"
    >
      <path
        d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
        fill={props.color}
      />
    </svg>
  )
}

interface SparklesTextProps {
  /**
   * @default ""
   * @type string
   * @description
   * The className of the text
   */
  className?: string

  /**
   * @required
   * @type ReactNode
   * @description
   * The content to be displayed
   */
  children: JSX.Element

  /**
   * @default 10
   * @type number
   * @description
   * The count of sparkles
   */
  sparklesCount?: number

  /**
   * @default "{first: '#9E7AFF', second: '#FE8BBB'}"
   * @type string
   * @description
   * The colors of the sparkles
   */
  colors?: {
    first: string
    second: string
  }
}

export function SparklesText(props: SparklesTextProps) {
  const rest = omit(props, 'children', 'colors', 'sparklesCount', 'className')
  const colors = () => props.colors ?? { first: '#9E7AFF', second: '#FE8BBB' } as const
  const sparklesCount = () => props.sparklesCount ?? 10
  const [sparkles, setSparkles] = createSignal<SparkleData[]>([])

  createEffect(
    () => ({
      colors: colors(),
      sparklesCount: sparklesCount(),
    }),
    ({ colors: colorsValue, sparklesCount }) => {
      const generateStar = (starColors: { first: string, second: string }): SparkleData => {
        const starX = `${Math.random() * 100}%`
        const starY = `${Math.random() * 100}%`
        const color = Math.random() > 0.5 ? starColors.first : starColors.second
        const delay = Math.random() * 2
        const scale = Math.random() * 1 + 0.3
        const lifespan = Math.random() * 10 + 5
        const id = `${starX}-${starY}-${Date.now()}`
        return { id, x: starX, y: starY, color, delay, scale, lifespan }
      }

      const initializeStars = () => {
        const newSparkles = Array.from({ length: sparklesCount }, () => generateStar(colorsValue))
        setSparkles(newSparkles)
      }

      const updateStars = () => {
        const starColors = colors()
        setSparkles((currentSparkles) => {
          const next = currentSparkles.slice()
          for (let i = 0; i < next.length; i++) {
            const star = next[i]
            if (star.lifespan <= 0) {
              next[i] = generateStar(starColors)
            }
            else {
              star.lifespan -= 0.1
            }
          }
          return next
        })
      }

      initializeStars()
      const interval = setInterval(updateStars, 100)

      return () => clearInterval(interval)
    },
  )

  return (
    <div
      class={cn('text-6xl font-bold', props.className)}
      {...rest}
      style={
        {
          '--sparkles-first-color': `${colors().first}`,
          '--sparkles-second-color': `${colors().second}`,
        } as JSX.CSSProperties
      }
    >
      <span class="relative inline-block">
        <For each={sparkles()}>
          {sparkle => <Sparkle {...sparkle} />}
        </For>
        <strong>{props.children}</strong>
      </span>
    </div>
  )
}
