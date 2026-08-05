import type { SpringOptions } from '@solid-primitives/spring'
import type { JSX } from 'solid-js'
import { createSpring } from '@solid-primitives/spring'
import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js'
import { cn } from '@/lib/utils'

interface MagicCardBaseProps {
  children?: JSX.Element
  class?: string
  gradientSize?: number
  gradientFrom?: string
  gradientTo?: string
}

interface MagicCardGradientProps extends MagicCardBaseProps {
  mode?: 'gradient'

  gradientColor?: string
  gradientOpacity?: number

  glowFrom?: never
  glowTo?: never
  glowAngle?: never
  glowSize?: never
  glowBlur?: never
  glowOpacity?: never
}

interface MagicCardOrbProps extends MagicCardBaseProps {
  mode: 'orb'

  glowFrom?: string
  glowTo?: string
  glowAngle?: number
  glowSize?: number
  glowBlur?: number
  glowOpacity?: number

  gradientColor?: never
  gradientOpacity?: never
}

type MagicCardProps = MagicCardGradientProps | MagicCardOrbProps
type ResetReason = 'enter' | 'leave' | 'global' | 'init'

// framer-motion 量纲（stiffness/mass/damping）→ @solid-primitives/spring 归一化量纲
function toSpringOptions(stiffness: number, damping: number, mass: number): SpringOptions {
  return {
    stiffness: stiffness / (mass * 60 * 60),
    damping: damping / 60,
  }
}

export function MagicCard(props: MagicCardProps) {
  const isOrb = untrack(() => props.mode) === 'orb'

  const initialGradientSize = untrack(() => props.gradientSize) ?? 200

  const [isDarkTheme, setIsDarkTheme] = createSignal(true)
  const [mouseX, setMouseX] = createSignal(-initialGradientSize)
  const [mouseY, setMouseY] = createSignal(-initialGradientSize)

  const [orbX, setOrbX] = createSpring(0, toSpringOptions(250, 30, 0.6))
  const [orbY, setOrbY] = createSpring(0, toSpringOptions(250, 30, 0.6))
  const [orbVisible, setOrbVisible] = createSpring(0, toSpringOptions(300, 35, 1))

  createEffect(() => {
    if (typeof document === 'undefined')
      return
    const root = document.documentElement
    const update = () => setIsDarkTheme(root.dataset.theme === 'dark')
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    onCleanup(() => observer.disconnect())
  })

  const reset = (reason: ResetReason = 'leave') => {
    if (isOrb) {
      setOrbVisible(reason === 'enter' ? (props.glowOpacity ?? 0.9) : 0)
      return
    }
    setMouseX(-(props.gradientSize ?? 200))
    setMouseY(-(props.gradientSize ?? 200))
  }

  const handlePointerMove = (e: PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMouseX(x)
    setMouseY(y)
    if (isOrb) {
      setOrbX(x)
      setOrbY(y)
    }
  }

  createEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget)
        reset('global')
    }
    const handleBlur = () => reset('global')
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible')
        reset('global')
    }

    window.addEventListener('pointerout', handleGlobalPointerOut)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibility)

    onCleanup(() => {
      window.removeEventListener('pointerout', handleGlobalPointerOut)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibility)
    })
  })

  const background = createMemo(
    () => `linear-gradient(var(--color-background) 0 0) padding-box,
      radial-gradient(${props.gradientSize ?? 200}px circle at ${mouseX()}px ${mouseY()}px,
        ${props.gradientFrom ?? '#9E7AFF'},
        ${props.gradientTo ?? '#FE8BBB'},
        var(--color-border) 100%
      ) border-box`,
  )

  const gradientBackground = createMemo(
    () => `radial-gradient(${props.gradientSize ?? 200}px circle at ${mouseX()}px ${mouseY()}px,
      ${props.gradientColor ?? '#262626'},
      transparent 100%
    )`,
  )

  return (
    <div
      class={cn(
        `
          group relative isolate overflow-hidden rounded-[inherit] border
          border-transparent
        `,
        props.class,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => reset('leave')}
      onPointerEnter={() => reset('enter')}
      style={{ background: background() }}
    >
      <div class="absolute inset-px z-20 rounded-[inherit] bg-background" />

      {!isOrb && (
        <div
          class="
            pointer-events-none absolute inset-px z-30 rounded-[inherit]
            opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          "
          style={{
            background: gradientBackground(),
            opacity: props.gradientOpacity ?? 0.8,
          }}
        />
      )}

      {isOrb && (
        <div
          aria-hidden="true"
          class="pointer-events-none absolute z-30"
          style={{
            'width': `${props.glowSize ?? 420}px`,
            'height': `${props.glowSize ?? 420}px`,
            'transform': `translate(${orbX()}px, ${orbY()}px) translate(-50%, -50%)`,
            'border-radius': '9999px',
            'filter': `blur(${props.glowBlur ?? 60}px)`,
            'opacity': orbVisible(),
            'background': `linear-gradient(${props.glowAngle ?? 90}deg, ${props.glowFrom ?? '#ee4f27'}, ${props.glowTo ?? '#6b21ef'})`,
            'mix-blend-mode': isDarkTheme() ? 'screen' : 'multiply',
            'will-change': 'transform, opacity',
          }}
        />
      )}
      <div class="relative z-40">{props.children}</div>
    </div>
  )
}
