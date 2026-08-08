import { LightRays } from '@/registry/magicui/light-rays'

export function LightRaysDemo() {
  return (
    <div class="relative h-125 w-full overflow-hidden rounded-lg border">
      <div class="
        relative z-10 flex h-full flex-col items-center justify-center gap-4
        px-6 text-center
      "
      >
        <span class="
          text-xs font-semibold tracking-[0.35em] text-slate-800/60 uppercase
          dark:text-slate-200/60
        "
        >
          Ambient glow
        </span>
        <h1 class="
          text-4xl font-bold text-foreground
          md:text-5xl
        "
        >
          Light Rays
        </h1>
        <p class="
          max-w-md text-sm text-slate-800/80
          md:text-base
          dark:text-slate-200/80
        "
        >
          Drop this component into any container and it will fill the space with
          softly animated light rays shining from above.
        </p>
      </div>
      <LightRays />
    </div>
  )
}
