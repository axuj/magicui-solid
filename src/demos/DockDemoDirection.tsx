import { Icons } from '@/demos/shared/icons'
import { Dock, DockIcon } from '@/registry/magicui/dock'

export function DockDemoDirection() {
  return (
    <div class="flex flex-col items-center justify-center">
      <Dock direction="top">
        <DockIcon>
          <Icons.gitHub class="size-4" />
        </DockIcon>
        <DockIcon>
          <Icons.googleDrive class="size-4" />
        </DockIcon>
        <DockIcon>
          <Icons.notion class="size-4" />
        </DockIcon>
        <DockIcon>
          <Icons.whatsapp class="size-4" />
        </DockIcon>
      </Dock>
    </div>
  )
}
