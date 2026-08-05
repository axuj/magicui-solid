import { For } from 'solid-js'
import { Button } from '@/components/ui/button'
import { GlareHover } from '@/registry/magicui/glare-hover'

const features = [
  'Unlimited projects',
  'Team collaboration',
  'Advanced analytics',
]

export function GlareHoverDemo() {
  return (
    <GlareHover class="rounded-xl" duration={600}>
      <div class="w-85 rounded-xl border bg-card text-card-foreground shadow-sm">
        <div class="p-6 pb-2">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold tracking-tight">Pro</h3>
            <span class="
              inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs
              font-semibold
            "
            >
              Popular
            </span>
          </div>
          <p class="text-sm text-muted-foreground">
            For teams that need more.
          </p>
          <div class="flex items-baseline gap-1 pt-2">
            <span class="text-4xl font-semibold tracking-tight">$49</span>
            <span class="text-sm text-muted-foreground">/mo</span>
          </div>
        </div>
        <div class="flex flex-col gap-2.5 p-6 pt-2">
          <For each={features}>
            {f => (
              <div class="flex items-center gap-2 text-sm">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M12.5 3.5L6 10L2.5 6.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {f}
              </div>
            )}
          </For>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" opacity="0.4" />
            </svg>
            SSO (coming soon)
          </div>
        </div>
        <div class="p-6 pt-0">
          <Button class="w-full">Get started</Button>
        </div>
      </div>
    </GlareHover>
  )
}
