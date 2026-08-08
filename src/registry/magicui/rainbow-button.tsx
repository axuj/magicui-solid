import type { VariantProps } from 'class-variance-authority'
import type { JSX, ValidComponent } from 'solid-js'
import { cva } from 'class-variance-authority'
import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { cn } from '@/lib/utils'

const rainbowButtonVariants = cva(
  cn(
    'group relative animate-rainbow cursor-pointer transition-all',
    'inline-flex shrink-0 items-center justify-center gap-2',
    `
      rounded-sm outline-none
      focus-visible:ring-[3px]
      aria-invalid:border-destructive
    `,
    'text-sm font-medium whitespace-nowrap',
    'disabled:pointer-events-none disabled:opacity-50',
    `
      [&_svg]:pointer-events-none [&_svg]:shrink-0
      [&_svg:not([class*='size-'])]:size-4
    `,
  ),
  {
    variants: {
      variant: {
        default: `
          border-0
          bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
          bg-size-[200%] [background-clip:padding-box,border-box,border-box]
          bg-origin-border text-primary-foreground
          [border:calc(0.125rem)_solid_transparent]
          before:absolute before:bottom-[-20%] before:left-1/2 before:z-0
          before:h-1/5 before:w-3/5 before:-translate-x-1/2
          before:animate-rainbow
          before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
          before:bg-size-[200%] before:filter-[blur(0.75rem)]
          dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
        `,
        outline: `
          border border-input border-b-transparent
          bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
          bg-size-[200%] [background-clip:padding-box,border-box,border-box]
          bg-origin-border text-accent-foreground
          before:absolute before:bottom-[-20%] before:left-1/2 before:z-0
          before:h-1/5 before:w-3/5 before:-translate-x-1/2
          before:animate-rainbow
          before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
          before:bg-size-[200%] before:filter-[blur(0.75rem)]
          dark:bg-[linear-gradient(#0a0a0a,#0a0a0a),linear-gradient(#0a0a0a_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]
        `,
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-xl px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface RainbowButtonProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof rainbowButtonVariants> {
  /**
   * The element or component to render as
   */
  as?: ValidComponent
}

export function RainbowButton(props: RainbowButtonProps) {
  const [local, rest] = splitProps(props, ['class', 'variant', 'size', 'as', 'children'])

  return (
    <Dynamic
      component={local.as ?? 'button'}
      data-slot="button"
      class={cn(rainbowButtonVariants({ variant: local.variant, size: local.size, class: local.class }))}
      {...rest}
    >
      {local.children}
    </Dynamic>
  )
}

export { rainbowButtonVariants }
