import { Button } from '@/components/ui/button'
import { CoolMode } from '@/registry/magicui/cool-mode'

export function CoolModeDemo() {
  return (
    <div class="relative justify-center">
      <CoolMode>
        <Button>Click Me!</Button>
      </CoolMode>
    </div>
  )
}
