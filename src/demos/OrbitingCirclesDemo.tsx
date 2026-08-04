import { Icons } from '@/demos/shared/icons'
import { OrbitingCircles } from '@/registry/magicui/orbiting-circles'

export function OrbitingCirclesDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden
    "
    >
      <OrbitingCircles iconSize={40}>
        <Icons.whatsapp />
        <Icons.notion />
        <Icons.openai />
        <Icons.googleDrive />
        <Icons.whatsapp />
      </OrbitingCircles>
      <OrbitingCircles iconSize={30} radius={100} reverse speed={2}>
        <Icons.whatsapp />
        <Icons.notion />
        <Icons.openai />
        <Icons.googleDrive />
      </OrbitingCircles>
    </div>
  )
}
