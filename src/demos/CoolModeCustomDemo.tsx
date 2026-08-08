import { Button } from '@/components/ui/button'
import { CoolMode } from '@/registry/magicui/cool-mode'

export function CoolModeCustomDemo() {
  return (
    <div class="relative justify-center">
      <CoolMode
        options={{
          particle: 'https://avatars.githubusercontent.com/u/81306489',
        }}
      >
        <Button>Click Me!</Button>
      </CoolMode>
    </div>
  )
}
