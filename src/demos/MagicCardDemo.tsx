import { Button } from '@/components/ui/button'
import { createIsDark } from '@/demos/shared/theme'
import { MagicCard } from '@/registry/magicui/magic-card'

const inputClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none'

export function MagicCardDemo() {
  const isDark = createIsDark()
  return (
    <div class="w-full max-w-sm">
      <MagicCard
        gradientColor={isDark() ? '#262626' : '#D9D9D955'}
        class="rounded-xl"
      >
        <div class="border-b border-border p-4">
          <h3 class="text-lg font-semibold tracking-tight">Login</h3>
          <p class="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <form>
          <div class="grid gap-4 p-4">
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
        <div class="border-t border-border p-4">
          <Button class="w-full">Sign In</Button>
        </div>
      </MagicCard>
    </div>
  )
}
