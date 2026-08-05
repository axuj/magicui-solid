import { Button } from '@/components/ui/button'
import { BorderBeam } from '@/registry/magicui/border-beam'

const inputClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none'

export function BorderBeamDemo() {
  return (
    <div class="
      relative w-87.5 overflow-hidden rounded-xl border bg-card
      text-card-foreground shadow-sm
    "
    >
      <div class="space-y-1.5 p-6 pb-4">
        <h3 class="text-lg font-semibold tracking-tight">Login</h3>
        <p class="text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>
      <form>
        <div class="grid w-full items-center gap-4 p-6 pt-0">
          <div class="flex flex-col space-y-1.5">
            <label class="text-sm leading-none font-medium" for="email">Email</label>
            <input id="email" type="email" placeholder="Enter your email" class={inputClass} />
          </div>
          <div class="flex flex-col space-y-1.5">
            <label class="text-sm leading-none font-medium" for="password">Password</label>
            <input id="password" type="password" placeholder="Enter your password" class={inputClass} />
          </div>
        </div>
      </form>
      <div class="flex justify-between p-6 pt-0">
        <Button variant="outline">Register</Button>
        <Button>Login</Button>
      </div>
      <BorderBeam duration={8} size={100} />
    </div>
  )
}
