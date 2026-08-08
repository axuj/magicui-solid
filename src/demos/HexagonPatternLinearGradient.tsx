import { HexagonPattern } from '@/registry/magicui/hexagon-pattern'

export function HexagonPatternLinearGradient() {
  return (
    <div class="
      relative flex h-125 w-full items-center justify-center overflow-hidden
      rounded-lg border bg-background p-20
    "
    >
      <HexagonPattern
        radius={40}
        x={-1}
        y={-1}
        class="
          mask-[linear-gradient(to_bottom_right,white,transparent,transparent)]
        "
      />
    </div>
  )
}
