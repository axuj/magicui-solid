import type { JSX } from 'solid-js'
import { scrollInfo } from 'motion'
import { createEffect, createSignal, onCleanup, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

interface ScrollProgressProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string
}

export function ScrollProgress(props: ScrollProgressProps) {
  const [local, rest] = splitProps(props, ['class'])
  const [progress, setProgress] = createSignal(0)

  createEffect(() => {
    const stopScroll = scrollInfo(info => setProgress(info.y.progress))
    onCleanup(stopScroll)
  })

  return (
    <div
      class={cn(
        `
          fixed inset-x-0 top-0 z-50 h-px origin-left bg-linear-to-r
          from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]
        `,
        local.class,
      )}
      style={{ transform: `scaleX(${progress()})` }}
      {...rest}
    />
  )
}
