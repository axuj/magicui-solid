import { Button } from '@/components/ui/button'
import { BorderBeam } from '@/registry/magicui/border-beam'

export function BorderBeamDemo4() {
  return (
    <Button class="relative overflow-hidden" size="lg" variant="outline">
      Buy Now
      <BorderBeam
        size={40}
        initialOffset={20}
        class="from-transparent via-yellow-500 to-transparent"
        transition={{
          type: 'spring',
          stiffness: 60,
          damping: 20,
        }}
      />
    </Button>
  )
}
