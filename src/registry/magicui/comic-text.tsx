import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { createEffect, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

interface ComicTextProps {
  children: string
  class?: string
  style?: JSX.CSSProperties
  fontSize?: number
}

export function ComicText(props: ComicTextProps) {
  const fontSize = () => props.fontSize ?? 5

  createEffect(() => [props.children], ([children]) => {
    if (typeof children !== 'string') {
      throw new TypeError('children must be a string')
    }
  })

  const dotColor = '#EF4444'
  const backgroundColor = '#FACC15'

  let ref: HTMLDivElement | undefined

  onSettled(() => {
    if (!ref)
      return
    const anim = animate(
      ref,
      { opacity: [0, 1], scale: [0.8, 1], rotate: [-2, 0] },
      {
        duration: 0.6,
        ease: [0.175, 0.885, 0.32, 1.275],
        type: 'spring',
      },
    )
    return () => anim.stop()
  })

  return (
    <div
      ref={ref}
      class={cn('text-center select-none', props.class)}
      style={{
        'font-size': `${fontSize()}rem`,
        'font-family': '\'Bangers\', \'Comic Sans MS\', \'Impact\', sans-serif',
        'font-weight': '900',
        '-webkit-text-stroke': `${fontSize() * 0.35}px #000000`,
        'transform': 'skewX(-10deg)',
        'text-transform': 'uppercase',
        'filter': `
          drop-shadow(5px 5px 0px #000000)
          drop-shadow(3px 3px 0px ${dotColor})
        `,
        'background-color': backgroundColor,
        'background-image': `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        'background-size': '8px 8px',
        'background-clip': 'text',
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  )
}
