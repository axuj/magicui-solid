import { animate } from 'motion'
import { onSettled } from 'solid-js'

import { Pointer } from '@/registry/magicui/pointer'

function AnimatedHeart() {
  let wrapperEl: HTMLDivElement | undefined
  let pathEl: SVGPathElement | undefined

  onSettled(() => {
    if (!wrapperEl || !pathEl)
      return

    const wrapperAnim = animate(
      wrapperEl,
      { scale: [0.8, 1, 0.8], rotate: [0, 5, -5, 0] },
      { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    )
    const pathAnim = animate(
      pathEl,
      { scale: [1, 1.2, 1] },
      { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
    )

    return () => {
      wrapperAnim.stop()
      pathAnim.stop()
    }
  })

  return (
    <div ref={wrapperEl}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="text-pink-600"
      >
        <path
          ref={pathEl}
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

export function PointerDemo() {
  return (
    <div class="
      grid grid-cols-1 gap-6
      md:grid-cols-2 md:grid-rows-2
    "
    >
      <div class="rounded-lg border p-4">
        <div class="relative flex h-40 flex-col items-center justify-center">
          <h3 class="text-xl font-semibold">Animated Pointer</h3>
          <p class="text-sm text-muted-foreground">Animated pointer</p>
        </div>
        <Pointer>
          <AnimatedHeart />
        </Pointer>
      </div>

      <div class="rounded-lg border p-4">
        <div class="relative flex h-40 flex-col items-center justify-center">
          <h3 class="text-xl font-semibold">Colored Pointer</h3>
          <p class="text-sm text-muted-foreground">
            A custom pointer with different color
          </p>
        </div>
        <Pointer class="fill-blue-500" />
      </div>

      <div class="rounded-lg border p-4">
        <div class="relative flex h-40 flex-col items-center justify-center">
          <h3 class="text-xl font-semibold">Custom Shape</h3>
          <p class="text-sm text-muted-foreground">
            A pointer with a custom SVG shape
          </p>
        </div>
        <Pointer>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" class="fill-purple-500" />
            <circle cx="12" cy="12" r="5" class="fill-white" />
          </svg>
        </Pointer>
      </div>

      <div class="rounded-lg border p-4">
        <div class="relative flex h-40 flex-col items-center justify-center">
          <h3 class="text-xl font-semibold">Emoji Pointer</h3>
          <p class="text-sm text-muted-foreground">
            Using an emoji as a custom pointer
          </p>
        </div>
        <Pointer>
          <div class="text-2xl">👆</div>
        </Pointer>
      </div>
    </div>
  )
}
