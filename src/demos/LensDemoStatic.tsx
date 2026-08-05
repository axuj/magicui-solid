import { Button } from '@/components/ui/button'
import { Lens } from '@/registry/magicui/lens'

const IMAGE_URL = 'https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export function LensDemoStatic() {
  return (
    <div class="
      relative max-w-md rounded-xl border bg-card text-card-foreground
      shadow-none
    "
    >
      <div class="p-6">
        <Lens isStatic position={{ x: 260, y: 150 }}>
          <img
            class="rounded-xl"
            src={IMAGE_URL}
            alt="image placeholder"
            width={500}
            height={500}
          />
        </Lens>
      </div>
      <div class="space-y-1.5 p-6 pt-0">
        <h3 class="text-2xl leading-none font-semibold tracking-tight">Your next camp</h3>
        <p class="text-sm text-muted-foreground">
          See our latest and best camp destinations all across the five continents of the globe.
        </p>
      </div>
      <div class="flex items-center gap-4 p-6 pt-0">
        <Button>Let&apos;s go</Button>
        <Button variant="secondary">Another time</Button>
      </div>
    </div>
  )
}
