import type { TargetAndTransition } from 'motion'
import { Play, XIcon } from 'lucide-solid'
import { animate } from 'motion'
import { createEffect, createSignal, mergeProps, onCleanup, Show, splitProps } from 'solid-js'
import { Portal } from 'solid-js/web'
import { cn } from '@/lib/utils'

type AnimationStyle
  = | 'from-bottom'
    | 'from-center'
    | 'from-top'
    | 'from-left'
    | 'from-right'
    | 'fade'
    | 'top-in-bottom-out'
    | 'left-in-right-out'

interface HeroVideoProps {
  animationStyle?: AnimationStyle
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt?: string
  class?: string
}

interface AnimationVariant {
  initial: TargetAndTransition
  animate: TargetAndTransition
  exit: TargetAndTransition
}

const animationVariants: Record<AnimationStyle, AnimationVariant> = {
  'from-bottom': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'from-center': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  'from-top': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  'from-left': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  'from-right': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'top-in-bottom-out': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'left-in-right-out': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
}

const springTransition = { type: 'spring', damping: 30, stiffness: 300 } as const

function applyInitialStyle(el: HTMLElement, initial: TargetAndTransition) {
  const transforms: string[] = []
  if (initial.y !== undefined)
    transforms.push(`translateY(${initial.y})`)
  if (initial.x !== undefined)
    transforms.push(`translateX(${initial.x})`)
  if (initial.scale !== undefined)
    transforms.push(`scale(${initial.scale})`)
  if (transforms.length > 0)
    el.style.transform = transforms.join(' ')
  if (initial.opacity !== undefined)
    el.style.opacity = String(initial.opacity)
}

export function HeroVideoDialog(props: HeroVideoProps) {
  const merged = mergeProps({ animationStyle: 'from-center', thumbnailAlt: 'Video thumbnail' }, props)
  const [local] = splitProps(merged, ['animationStyle', 'videoSrc', 'thumbnailSrc', 'thumbnailAlt', 'class'])

  const [isVideoOpen, setIsVideoOpen] = createSignal(false)
  const [mounted, setMounted] = createSignal(false)

  const [overlayEl, setOverlayEl] = createSignal<HTMLDivElement>()
  const [dialogEl, setDialogEl] = createSignal<HTMLDivElement>()

  function openDialog() {
    setIsVideoOpen(true)
    setMounted(true)
  }

  function closeDialog() {
    setIsVideoOpen(false)
  }

  createEffect(() => {
    const overlay = overlayEl()
    const dialog = dialogEl()
    if (!mounted() || !overlay || !dialog)
      return

    const selectedAnimation = animationVariants[local.animationStyle as AnimationStyle]

    if (isVideoOpen()) {
      applyInitialStyle(dialog, selectedAnimation.initial)
      const animOverlay = animate(overlay, { opacity: 1 }, { duration: 0.2 })
      const animDialog = animate(dialog, selectedAnimation.animate, springTransition)
      onCleanup(() => {
        animOverlay.stop()
        animDialog.stop()
      })
    }
    else {
      const animOverlay = animate(overlay, { opacity: 0 }, { duration: 0.2 })
      const animDialog = animate(dialog, selectedAnimation.exit, springTransition)
      onCleanup(() => {
        animOverlay.stop()
        animDialog.stop()
      })
      void Promise.all([animOverlay.finished, animDialog.finished])
        .then(() => setMounted(false))
        .catch(() => {})
    }
  })

  return (
    <div class={cn('relative', local.class)}>
      <button
        type="button"
        aria-label="Play video"
        class="group relative cursor-pointer border-0 bg-transparent p-0"
        onClick={openDialog}
      >
        <img
          src={local.thumbnailSrc}
          alt={local.thumbnailAlt}
          width={1920}
          height={1080}
          class="
            w-full rounded-md border shadow-lg transition-all duration-200
            ease-out
            group-hover:brightness-[0.8]
          "
        />
        <div class="
          absolute inset-0 flex scale-[0.9] items-center justify-center
          rounded-2xl transition-all duration-200 ease-out
          group-hover:scale-100
        "
        >
          <div class="
            flex size-28 items-center justify-center rounded-full bg-primary/10
            backdrop-blur-md
          "
          >
            <div
              class="
                relative flex size-20 scale-100 items-center justify-center
                rounded-full bg-linear-to-b from-primary/30 to-primary shadow-md
                transition-all duration-200 ease-out
                group-hover:scale-[1.2]
              "
            >
              <Play
                class="
                  size-8 scale-100 fill-white text-white transition-transform
                  duration-200 ease-out
                  group-hover:scale-105
                "
                style={{
                  filter:
                    'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
                }}
              />
            </div>
          </div>
        </div>
      </button>
      <Portal>
        <Show when={mounted()}>
          <div
            ref={(el) => {
              setOverlayEl(el)
              return () => setOverlayEl(undefined)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                closeDialog()
              }
            }}
            onClick={closeDialog}
            class="
              fixed inset-0 z-50 flex items-center justify-center bg-black/50
              backdrop-blur-md
            "
            style={{ opacity: 0 }}
          >
            <div
              ref={(el) => {
                setDialogEl(el)
                return () => setDialogEl(undefined)
              }}
              class="
                relative mx-4 aspect-video w-full max-w-4xl
                md:mx-0
              "
            >
              <button
                type="button"
                class="
                  absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2
                  text-xl text-white ring-1 backdrop-blur-md
                  dark:bg-neutral-100/50 dark:text-black
                "
              >
                <XIcon class="size-5" />
              </button>
              <div class="
                relative isolate z-1 size-full overflow-hidden rounded-2xl
                border-2 border-white
              "
              >
                <iframe
                  src={local.videoSrc}
                  title="Hero Video player"
                  class="mt-0 size-full rounded-2xl"
                  allowfullscreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
            </div>
          </div>
        </Show>
      </Portal>
    </div>
  )
}
