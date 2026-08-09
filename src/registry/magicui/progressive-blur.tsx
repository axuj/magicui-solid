import type { JSX } from 'solid-js'
import { For, mergeProps } from 'solid-js'
import { cn } from '~/lib/utils'

export interface ProgressiveBlurProps {
  class?: string
  height?: string
  position?: 'top' | 'bottom' | 'both'
  blurLevels?: number[]
  children?: JSX.Element
}

const DEFAULT_BLUR_LEVELS = [0.5, 1, 2, 4, 8, 16, 32, 64]

const positionClass = {
  top: 'top-0',
  bottom: 'bottom-0',
  both: 'inset-y-0',
}

export function ProgressiveBlur(props: ProgressiveBlurProps) {
  const merged = mergeProps(
    { height: '30%', position: 'bottom' as const, blurLevels: DEFAULT_BLUR_LEVELS },
    props,
  )

  const maskImage = (index: number): string => {
    if (merged.position === 'both')
      return 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,1) 5%, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)'

    const direction = merged.position === 'top' ? 'to top' : 'to bottom'
    if (index === merged.blurLevels!.length - 1)
      return `linear-gradient(${direction}, rgba(0,0,0,0) 87.5%, rgba(0,0,0,1) 100%)`

    return `linear-gradient(${direction}, rgba(0,0,0,0) ${index * 12.5}%, rgba(0,0,0,1) ${(index + 1) * 12.5}%, rgba(0,0,0,1) ${(index + 2) * 12.5}%, rgba(0,0,0,0) ${(index + 3) * 12.5}%)`
  }

  const blurStyle = (level: number, index: number): JSX.CSSProperties => ({
    'z-index': String(index + 1),
    'backdrop-filter': `blur(${level}px)`,
    '-webkit-backdrop-filter': `blur(${level}px)`,
    'mask-image': maskImage(index),
    '-webkit-mask-image': maskImage(index),
  })

  return (
    <div
      class={cn(
        'pointer-events-none absolute inset-x-0 z-10',
        merged.class,
        positionClass[merged.position],
      )}
      style={{ height: merged.position === 'both' ? '100%' : merged.height }}
    >
      <For each={merged.blurLevels}>
        {(level, index) => (
          <div
            class="absolute inset-0"
            style={blurStyle(level, index())}
          />
        )}
      </For>
    </div>
  )
}
