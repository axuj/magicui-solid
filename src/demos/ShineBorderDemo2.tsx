import { Button } from '@/components/ui/button'
import { createIsDark } from '@/demos/shared/theme'
import { ShineBorder } from '@/registry/magicui/shine-border'

const inputClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none'

export function ShineBorderDemo2() {
  const isDark = createIsDark()
  return (
    <div class="
      relative overflow-hidden rounded-xl border bg-card text-card-foreground
      shadow-sm
    "
    >
      <ShineBorder shineColor={isDark() ? 'white' : 'black'} />
      <div class="space-y-1.5 p-6 pb-4">
        <h3 class="text-lg font-semibold tracking-tight">Login</h3>
        <p class="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <form>
        <div class="grid gap-4 p-6 pt-0">
          <div class="grid gap-2">
            <label class="text-sm leading-none font-medium" for="email">Email</label>
            <input id="email" type="email" placeholder="name@example.com" class={inputClass} />
          </div>
          <div class="grid gap-2">
            <label class="text-sm leading-none font-medium" for="password">Password</label>
            <input id="password" type="password" class={inputClass} />
          </div>
        </div>
      </form>
      <div class="p-6 pt-0">
        <Button class="w-full">Sign In</Button>
      </div>
    </div>
  )
}
