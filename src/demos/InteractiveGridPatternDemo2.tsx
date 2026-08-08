import { cn } from '@/lib/utils'
import { InteractiveGridPattern } from '@/registry/magicui/interactive-grid-pattern'

export function InteractiveGridPatternDemo2() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <InteractiveGridPattern
        class={cn(
          `mask-[radial-gradient(400px_circle_at_center,white,transparent)]`,
        )}
        width={20}
        height={20}
        squares={[80, 80]}
        squaresClassName="hover:fill-blue-500"
      />
    </div>
  )
}
