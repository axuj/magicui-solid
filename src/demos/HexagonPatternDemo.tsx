import { HexagonPattern } from '@/registry/magicui/hexagon-pattern'

export function HexagonPatternDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <HexagonPattern
        hexagons={[
          [1, 1],
          [4, 4],
          [2, 2],
          [3, 4],
          [5, 4],
          [8, 2],
          [6, 3],
          [8, 5],
          [10, 10],
        ]}
        class="
          inset-0 skew-y-6
          mask-[radial-gradient(420px_circle_at_center,white,transparent)]
        "
      />
    </div>
  )
}
