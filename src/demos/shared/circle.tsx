import type { JSX } from 'solid-js'
import { cn } from '@/lib/utils'

export function Circle(props: {
  class?: string
  children?: JSX.Element
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}) {
  return (
    <div
      ref={props.ref}
      class={cn(`
        z-10 flex size-12 items-center justify-center rounded-full border-2
        bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]
      `, props.class)}
    >
      {props.children}
    </div>
  )
}
