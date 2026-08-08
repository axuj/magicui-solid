import { cn } from '@/lib/utils'
import { InteractiveGridPattern } from '@/registry/magicui/interactive-grid-pattern'

export function InteractiveGridPatternDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <InteractiveGridPattern
        class={cn(
          `mask-[radial-gradient(400px_circle_at_center,white,transparent)]`,
          'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12',
        )}
      />
    </div>
  )
}
