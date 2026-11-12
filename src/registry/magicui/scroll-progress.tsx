import type { JSX } from '@solidjs/web'
import { scrollInfo } from 'motion'
import { createSignal, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

interface ScrollProgressProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string
}

export function ScrollProgress(props: ScrollProgressProps) {
  const rest = omit(props, 'class')
  const [progress, setProgress] = createSignal(0)

  onSettled(() => {
    const stopScroll = scrollInfo(info => setProgress(info.y.progress))
    return (stopScroll)
  })

  return (
    <div
      class={cn(
        `
          fixed inset-x-0 top-0 z-50 h-px origin-left bg-linear-to-r
          from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]
        `,
        props.class,
      )}
      style={{ transform: `scaleX(${progress()})` }}
      {...rest}
    />
  )
}
