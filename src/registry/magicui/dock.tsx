import type { VariantProps } from 'class-variance-authority'
import type { Accessor, JSX } from 'solid-js'
import { cva } from 'class-variance-authority'
import { animate, transform } from 'motion'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  untrack,
  useContext,
} from 'solid-js'
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
  const merged = mergeProps(
    {
      iconSize: DEFAULT_SIZE,
      iconMagnification: DEFAULT_MAGNIFICATION,
      disableMagnification: DEFAULT_DISABLEMAGNIFICATION,
      iconDistance: DEFAULT_DISTANCE,
      direction: 'middle',
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'class',
    'children',
    'iconSize',
    'iconMagnification',
    'disableMagnification',
    'iconDistance',
    'direction',
    'ref',
  ])
  const [mouseX, setMouseX] = createSignal(Infinity)

  const contextValue: DockContextValue = {
    mouseX,
    iconSize: () => local.iconSize,
    iconMagnification: () => local.iconMagnification,
    disableMagnification: () => local.disableMagnification,
    iconDistance: () => local.iconDistance,
  }

  return (
    <DockContext.Provider value={contextValue}>
      <div
        ref={local.ref}
        role="toolbar"
        onMouseMove={e => setMouseX(e.pageX)}
        onMouseLeave={() => setMouseX(Infinity)}
        {...rest}
        class={cn(dockVariants({ class: local.class }), {
          'items-start': local.direction === 'top',
          'items-center': local.direction === 'middle',
          'items-end': local.direction === 'bottom',
        })}
      >
        {local.children}
      </div>
    </DockContext.Provider>
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
  const merged = mergeProps(
    {
      size: DEFAULT_SIZE,
      magnification: DEFAULT_MAGNIFICATION,
      distance: DEFAULT_DISTANCE,
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'class',
    'children',
    'size',
    'magnification',
    'disableMagnification',
    'distance',
    'mouseX',
  ])
  const dockContext = useContext(DockContext)

  const [iconEl, setIconEl] = createSignal<HTMLDivElement>()

  const mouseX = () => dockContext ? dockContext.mouseX() : (local.mouseX?.() ?? Infinity)
  const iconSize = () => dockContext ? dockContext.iconSize() : local.size
  const magnification = () => dockContext ? dockContext.iconMagnification() : local.magnification
  const disableMagnification = () => dockContext ? dockContext.disableMagnification() : local.disableMagnification
  const iconDistance = () => dockContext ? dockContext.iconDistance() : local.distance
  const targetSize = () => disableMagnification() ? iconSize() : magnification()

  const sizeTransform = createMemo(() =>
    transform([-iconDistance(), 0, iconDistance()], [iconSize(), targetSize(), iconSize()]),
  )

  createEffect(() => {
    const el = iconEl()
    if (!el)
      return
    const bounds = el.getBoundingClientRect()
    const distance = mouseX() - bounds.x - bounds.width / 2
    const clamped = Math.max(-iconDistance(), Math.min(iconDistance(), distance))
    const target = sizeTransform()(clamped)
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
    onCleanup(() => animation.stop())
  })

  return (
    <div
      ref={setIconEl}
      style={{
        width: `${untrack(iconSize)}px`,
        height: `${untrack(iconSize)}px`,
        padding: `${Math.max(6, untrack(iconSize) * 0.2)}px`,
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
        local.class,
      )}
      {...rest}
    >
      <div>{local.children}</div>
    </div>
  )
}
