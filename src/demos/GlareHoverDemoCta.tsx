import { Button } from '@/components/ui/button'
import { GlareHover } from '@/registry/magicui/glare-hover'

export function GlareHoverDemoCta() {
  return (
    <GlareHover class="rounded-xl" color="#505050" duration={700}>
      <div class="
        w-full rounded-xl border bg-card text-center text-card-foreground
        shadow-sm
      "
      >
        <div class="space-y-1.5 p-6 pb-0">
          <p class="
            text-xs font-medium tracking-widest text-muted-foreground uppercase
          "
          >
            14-day free trial · No card required
          </p>
          <h3 class="text-2xl font-semibold tracking-tight">
            Ready to get started?
          </h3>
          <p class="mx-auto max-w-sm text-sm text-muted-foreground">
            Join 4,000+ teams already using our platform to ship faster.
          </p>
        </div>
        <div class="flex justify-center gap-2 p-6">
          <Button>Start free trial</Button>
          <Button variant="outline">View demo</Button>
        </div>
      </div>
    </GlareHover>
  )
}
