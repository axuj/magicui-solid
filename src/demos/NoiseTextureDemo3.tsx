import { Button } from '@/components/ui/button'
import { NoiseTexture } from '@/registry/magicui/noise-texture'

export function NoiseTextureDemo3() {
  return (
    <div class="flex justify-center p-8">
      <Button
        class="
          group/button relative cursor-pointer overflow-hidden px-8
          active:scale-98
        "
        type="button"
        variant="secondary"
      >
        <span class="relative z-10 font-medium">Subscribe</span>
        <NoiseTexture
          noiseOpacity={0.45}
          class="
            size-full! transition-all
            group-hover/button:opacity-100
          "
        />
      </Button>
    </div>
  )
}
