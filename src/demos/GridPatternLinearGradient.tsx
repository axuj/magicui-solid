import { GridPattern } from '@/registry/magicui/grid-pattern'

export function GridPatternLinearGradient() {
  return (
    <div class="
      relative flex size-full items-center justify-center overflow-hidden
      rounded-lg border bg-background p-20
    "
    >
      <GridPattern
        width={20}
        height={20}
        x={-1}
        y={-1}
        class="
          mask-[linear-gradient(to_bottom_right,white,transparent,transparent)]
        "
      />
    </div>
  )
}
