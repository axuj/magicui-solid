import type { JSX } from '@solidjs/web'
import type { VariantProps } from 'class-variance-authority'
import type { Accessor } from 'solid-js'

import { cva } from 'class-variance-authority'
import { animate, transform } from 'motion'
import { createContext, createEffect, createMemo, createSignal, omit, untrack, useContext } from 'solid-js'

import { cn } from '@/lib/utils'

export interface DockProps extends VariantProps<typeof dockVariants> {
  class?: string
  iconSize?: number
  iconMagnification?: number
  disableMagnification?: boolean
  iconDistance?: number
  direction?: 'top' | 'middle' | 'bottom'
  children: JSX.Element
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const DEFAULT_SIZE = 40
const DEFAULT_MAGNIFICATION = 60
const DEFAULT_DISTANCE = 140
const DEFAULT_DISABLEMAGNIFICATION = false

export const dockVariants = cva(
  `
    mx-auto mt-8 flex h-14.5 w-max items-center justify-center gap-2 rounded-2xl
    border p-2 backdrop-blur-md
    supports-backdrop-blur:bg-white/10
    supports-backdrop-blur:dark:bg-black/10
  `,
)

interface DockContextValue {
  mouseX: Accessor<number>
  iconSize: Accessor<number>
  iconMagnification: Accessor<number>
  disableMagnification: Accessor<boolean>
  iconDistance: Accessor<number>
}

const DockContext = createContext<DockContextValue>()

export function Dock(props: DockProps) {
  const rest = omit(props, 'class', 'children', 'iconSize', 'iconMagnification', 'disableMagnification', 'iconDistance', 'direction', 'ref')
  const direction = () => props.direction ?? 'middle'
  const [mouseX, setMouseX] = createSignal(Infinity)

  const contextValue: DockContextValue = {
    mouseX,
    iconSize: () => (props.iconSize ?? DEFAULT_SIZE),
    iconMagnification: () => (props.iconMagnification ?? DEFAULT_MAGNIFICATION),
    disableMagnification: () => (props.disableMagnification ?? DEFAULT_DISABLEMAGNIFICATION),
    iconDistance: () => (props.iconDistance ?? DEFAULT_DISTANCE),
  }

  return (
    <DockContext value={contextValue}>
      <div
        ref={props.ref}
        role="toolbar"
        onMouseMove={e => setMouseX(e.pageX)}
        onMouseLeave={() => setMouseX(Infinity)}
        {...rest}
        class={cn(dockVariants({ class: props.class }), {
          'items-start': direction() === 'top',
          'items-center': direction() === 'middle',
          'items-end': direction() === 'bottom',
        })}
      >
        {props.children}
      </div>
    </DockContext>
  )
}

export interface DockIconProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: number
  magnification?: number
  disableMagnification?: boolean
  distance?: number
  mouseX?: Accessor<number>
  class?: string
  children?: JSX.Element
}

export function DockIcon(props: DockIconProps) {
  const rest = omit(props, 'class', 'children', 'size', 'magnification', 'disableMagnification', 'distance', 'mouseX')
  const dockContext = useContext(DockContext)

  const [iconEl, setIconEl] = createSignal<HTMLDivElement>()

  const mouseX = () => dockContext ? dockContext.mouseX() : (props.mouseX?.() ?? Infinity)
  const iconSize = () => dockContext ? dockContext.iconSize() : (props.size ?? DEFAULT_SIZE)
  const magnification = () => dockContext ? dockContext.iconMagnification() : (props.magnification ?? DEFAULT_MAGNIFICATION)
  const disableMagnification = () => dockContext ? dockContext.disableMagnification() : (props.disableMagnification ?? DEFAULT_DISABLEMAGNIFICATION)
  const iconDistance = () => dockContext ? dockContext.iconDistance() : (props.distance ?? DEFAULT_DISTANCE)
  const targetSize = () => disableMagnification() ? iconSize() : magnification()
  // The inline style is a one-time seed; the spring animation owns the size
  // afterwards, so a later `size` change must not fight it over the same style.
  const initialIconSize = untrack(iconSize)

  const sizeTransform = createMemo(() =>
    transform([-iconDistance(), 0, iconDistance()], [iconSize(), targetSize(), iconSize()]),
  )

  createEffect(
    () => ({ iconEl: iconEl(), mouseX: mouseX(), iconDistance: iconDistance(), sizeTransform: sizeTransform() }),
    ({ iconEl, mouseX, iconDistance, sizeTransform }) => {
      const el = iconEl
      if (!el)
        return
      const bounds = el.getBoundingClientRect()
      const distance = mouseX - bounds.x - bounds.width / 2
      const clamped = Math.max(-iconDistance, Math.min(iconDistance, distance))
      const target = sizeTransform(clamped)
      const animation = animate(
        el,
        { width: target, height: target },
        {
          type: 'spring',
          mass: 0.1,
          stiffness: 150,
          damping: 12,
        },
      )
      return () => animation.stop()
    },
  )

  return (
    <div
      ref={setIconEl}
      style={{
        width: `${initialIconSize}px`,
        height: `${initialIconSize}px`,
        padding: `${Math.max(6, initialIconSize * 0.2)}px`,
      }}
      class={cn(
        `
          flex aspect-square cursor-pointer items-center justify-center
          rounded-full
        `,
        disableMagnification() && `
          transition-colors
          hover:bg-muted-foreground
        `,
        props.class,
      )}
      {...rest}
    >
      <div>{props.children}</div>
    </div>
  )
}
