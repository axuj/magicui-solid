import { HexagonPattern } from '@/registry/magicui/hexagon-pattern'

export function HexagonPatternDashed() {
  return (
    <div class="
      relative flex h-125 w-full items-center justify-center overflow-hidden
      rounded-lg border bg-background p-20
    "
    >
      <HexagonPattern radius={40} x={-1} y={-1} strokeDasharray="4 2" />
    </div>
  )
}
