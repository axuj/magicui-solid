import { ArrowRight } from '@lucide/solid'

import { createIsDark } from '@/demos/shared/theme'
import { Floating3DParticles } from '@/registry/magicui/floating-3d-particles'

export function Floating3DParticlesDemo() {
  const isDark = createIsDark()
  const color = () => (isDark() ? '#ffffff' : '#000000')

  return (
    <div class="
      relative flex h-125 w-full items-center justify-center overflow-hidden
      rounded-lg border bg-background
    "
    >
      <Floating3DParticles color={color()} />

      <div class="
        relative z-10 flex flex-col items-center gap-6 px-6 text-center
      "
      >
        <h2 class="
          text-3xl font-bold tracking-tight
          md:text-5xl
        "
        >
          Build something magical
        </h2>
        <p class="
          max-w-xl text-base text-muted-foreground
          md:text-lg
        "
        >
          A pseudo-3D particle background that stays behind your content with
          continuous rotation and buoyant drift.
        </p>
        <button
          type="button"
          class="
            inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-6
            font-medium text-background no-underline transition-opacity
            hover:opacity-90
          "
        >
          Get Started
          <ArrowRight class="size-4" />
        </button>
      </div>
    </div>
  )
}
