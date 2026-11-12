import type { ComponentProps, JSX } from '@solidjs/web'

import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

export interface ShimmerButtonProps extends ComponentProps<'button'> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  class?: string
  children?: JSX.Element
}

export function ShimmerButton(props: ShimmerButtonProps) {
  const rest = omit(props, 'shimmerColor', 'shimmerSize', 'borderRadius', 'shimmerDuration', 'background', 'class', 'children')
  const borderRadius = () => props.borderRadius ?? '100px'
  const shimmerColor = () => props.shimmerColor ?? '#ffffff'
  const shimmerDuration = () => props.shimmerDuration ?? '3s'
  const shimmerSize = () => props.shimmerSize ?? '0.05em'

  return (
    <button
      style={{
        '--spread': '90deg',
        '--shimmer-color': shimmerColor(),
        '--radius': borderRadius(),
        '--speed': shimmerDuration(),
        '--cut': shimmerSize(),
        '--bg': (props.background ?? 'rgba(0, 0, 0, 1)'),
      } as JSX.CSSProperties}
      class={cn(
        `
          group relative z-0 flex cursor-pointer items-center justify-center
          overflow-hidden [border-radius:var(--radius)] border border-white/10
          px-6 py-3 whitespace-nowrap text-white [background:var(--bg)]
        `,
        `
          transform-gpu transition-transform duration-300 ease-in-out
          active:translate-y-px
        `,
        props.class,
      )}
      {...rest}
    >
      <div class="
        @container-size absolute inset-0 -z-30 overflow-visible blur-[2px]
      "
      >
        <div class="
          absolute inset-0 aspect-[1] h-[100cqh] animate-shimmer-slide
          rounded-none [mask:none]
        "
        >
          <div class="
            absolute -inset-full w-auto [translate:0_0] rotate-0
            animate-spin-around
            [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]
          "
          />
        </div>
      </div>
      {props.children}
      <div
        class={cn(
          'absolute inset-0 size-full',
          `
            rounded-2xl px-4 py-1.5 text-sm font-medium
            shadow-[inset_0_-8px_10px_#ffffff1f]
          `,
          'transform-gpu transition-all duration-300 ease-in-out',
          'group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]',
          'group-active:shadow-[inset_0_-10px_10px_#ffffff3f]',
        )}
      />
      <div class={cn(`
        absolute inset-(--cut) -z-20 [border-radius:var(--radius)]
        [background:var(--bg)]
      `)}
      />
    </button>
  )
}
