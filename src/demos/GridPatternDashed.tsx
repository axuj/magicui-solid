import { GridPattern } from '@/registry/magicui/grid-pattern'

export function GridPatternDashed() {
  return (
    <div class="
      relative flex size-full items-center justify-center overflow-hidden
      rounded-lg border bg-background p-20
    "
    >
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray="4 2"
        class="mask-[radial-gradient(300px_circle_at_center,white,transparent)]"
      />
    </div>
  )
}
