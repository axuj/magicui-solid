import { DotPattern } from '@/registry/magicui/dot-pattern'

export function DotPatternLinearGradient() {
  return (
    <div class="
      relative flex size-full items-center justify-center overflow-hidden
      rounded-lg border bg-background p-20
    "
    >
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        class="
          mask-[linear-gradient(to_bottom_right,white,transparent,transparent)]
        "
      />
    </div>
  )
}
