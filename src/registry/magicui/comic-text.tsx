import type { JSX } from 'solid-js'
import { animate } from 'motion'
import { createEffect, mergeProps, onCleanup, untrack } from 'solid-js'
import { cn } from '@/lib/utils'

interface ComicTextProps {
  children: string
  class?: string
  style?: JSX.CSSProperties
  fontSize?: number
}

export function ComicText(props: ComicTextProps) {
  const merged = mergeProps({ fontSize: 5 }, props)

  // type check only uses the initial value; children is consumed as-is below
  if (untrack(() => typeof merged.children) !== 'string') {
    throw new Error('children must be a string')
  }

  const dotColor = '#EF4444'
  const backgroundColor = '#FACC15'

  let ref: HTMLDivElement | undefined

  createEffect(() => {
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
    onCleanup(() => anim.stop())
  })

  return (
    <div
      ref={ref}
      class={cn('text-center select-none', merged.class)}
      style={{
        'font-size': `${merged.fontSize}rem`,
        'font-family': '\'Bangers\', \'Comic Sans MS\', \'Impact\', sans-serif',
        'font-weight': '900',
        '-webkit-text-stroke': `${merged.fontSize * 0.35}px #000000`,
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
        ...merged.style,
      }}
    >
      {merged.children}
    </div>
  )
}
