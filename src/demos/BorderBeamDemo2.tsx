import { Play, SkipBack, SkipForward } from '@lucide/solid'
import { Button } from '@/components/ui/button'
import { BorderBeam } from '@/registry/magicui/border-beam'

export function BorderBeamDemo2() {
  return (
    <div class="
      relative w-87.5 overflow-hidden rounded-xl border bg-card
      text-card-foreground shadow-sm
    "
    >
      <div class="space-y-1.5 p-6 pb-4">
        <h3 class="text-lg font-semibold tracking-tight">Now Playing</h3>
        <p class="text-sm text-muted-foreground">
          Stairway to Heaven - Led Zeppelin
        </p>
      </div>
      <div class="flex flex-col items-center gap-4 p-6">
        <div class="
          size-48 rounded-lg bg-linear-to-br from-purple-500 to-pink-500
        "
        />
        <div class="h-1 w-full rounded-full bg-secondary">
          <div class="h-full w-1/3 rounded-full bg-primary" />
        </div>
        <div class="flex w-full justify-between text-sm text-muted-foreground">
          <span>2:45</span>
          <span>8:02</span>
        </div>
      </div>
      <div class="flex justify-center gap-4 p-6 pt-0">
        <Button variant="outline" size="icon" class="rounded-full">
          <SkipBack class="size-4" />
        </Button>
        <Button size="icon" class="rounded-full">
          <Play class="size-4" />
        </Button>
        <Button variant="outline" size="icon" class="rounded-full">
          <SkipForward class="size-4" />
        </Button>
      </div>
      <BorderBeam
        duration={6}
        size={400}
        class="from-transparent via-red-500 to-transparent"
      />
      <BorderBeam
        duration={6}
        delay={3}
        size={400}
        borderWidth={2}
        class="from-transparent via-blue-500 to-transparent"
      />
    </div>
  )
}
