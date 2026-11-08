import { DitherField } from '@/registry/magicui/dither-field'

export function DitherFieldPointerDemo() {
  return (
    <DitherField
      pattern="clouds"
      color="var(--foreground)"
      dotSize={2}
      intensity={0.3}
      class="
        flex h-72 w-full items-end justify-center rounded-lg border
        bg-background p-4 select-none
        md:h-100 md:p-6
      "
    >
      <p class="
        rounded-full border bg-background/80 px-3 py-1 text-sm
        text-muted-foreground backdrop-blur-sm
      "
      >
        Hover, or touch and hold
      </p>
    </DitherField>
  )
}
