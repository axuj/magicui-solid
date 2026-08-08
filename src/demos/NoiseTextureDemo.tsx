import { cn } from '@/lib/utils'
import { NoiseTexture } from '@/registry/magicui/noise-texture'

export function NoiseTextureDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-neutral-100/80
      dark:bg-neutral-950
    "
    >
      <NoiseTexture
        class={cn(
          'absolute inset-0',
          'mask-[radial-gradient(420px_circle_at_center,white,transparent)]',
        )}
      />
    </div>
  )
}
