import { Icons } from '@/demos/shared/icons'
import { Dock, DockIcon } from '@/registry/magicui/dock'

export function DockDemoCustom() {
  return (
    <div class="flex flex-col items-center justify-center">
      <Dock iconMagnification={60} iconDistance={100}>
        <DockIcon class="
          bg-black/10
          dark:bg-white/10
        "
        >
          <Icons.gitHub class="size-full" />
        </DockIcon>
        <DockIcon class="
          bg-black/10
          dark:bg-white/10
        "
        >
          <Icons.googleDrive class="size-full" />
        </DockIcon>
        <DockIcon class="
          bg-black/10
          dark:bg-white/10
        "
        >
          <Icons.notion class="size-full" />
        </DockIcon>
        <DockIcon class="
          bg-black/10
          dark:bg-white/10
        "
        >
          <Icons.whatsapp class="size-full" />
        </DockIcon>
      </Dock>
    </div>
  )
}
