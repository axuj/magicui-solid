import { DitherField } from '@/registry/magicui/dither-field'

const ramp = ['var(--dither-low)', 'var(--dither-mid)', 'var(--dither-high)'] as const

export function DitherFieldDemo() {
  return (
    <DitherField
      pattern="horizon"
      color={ramp}
      class="
        flex h-105 w-full flex-col items-center justify-center gap-4 rounded-lg
        border bg-background px-4 pb-28 text-center select-none
        [--dither-high:#4c1d95] [--dither-low:#c4b5fd] [--dither-mid:#7c3aed]
        md:h-125 md:gap-6 md:px-6 md:pb-24
        dark:[--dither-high:#ede9fe] dark:[--dither-low:#2e1065]
        dark:[--dither-mid:#8b5cf6]
      "
    >
      <h1 class="
        max-w-xl text-3xl font-semibold tracking-tighter text-balance
        sm:text-4xl
        md:text-6xl
      "
      >
        Light, rendered one dot at a time
      </h1>
      <p class="
        max-w-md text-sm text-balance text-muted-foreground
        md:text-base
      "
      >
        An ordered-dither field that follows your theme, your brand colors and
        your pointer.
      </p>
      <div class="
        flex flex-wrap justify-center gap-2
        md:gap-3
      "
      >
        <button
          type="button"
          class="
            h-9 rounded-full bg-foreground px-4 text-sm font-medium
            whitespace-nowrap text-background
            md:h-10 md:px-5
          "
        >
          Get started
        </button>
        <button
          type="button"
          class="
            h-9 rounded-full border bg-background/80 px-4 text-sm font-medium
            whitespace-nowrap backdrop-blur-sm
            md:h-10 md:px-5
          "
        >
          Learn more
        </button>
      </div>
    </DitherField>
  )
}
