import { TextField, TextFieldInput, TextFieldLabel } from '@/components/ui/text-field'
import { NoiseTexture } from '@/registry/magicui/noise-texture'

export function NoiseTextureDemo4() {
  return (
    <div class="mx-auto flex max-w-sm flex-col gap-3 p-4">
      <TextField>
        <TextFieldLabel class="text-muted-foreground" for="noise-input-demo">
          Search with texture
        </TextFieldLabel>
        <div class="relative overflow-hidden rounded-lg border bg-muted/30">
          <NoiseTexture noiseOpacity={0.45} />
          <TextFieldInput
            class="
              relative z-10 border-0 bg-transparent shadow-none
              focus-visible:ring-2
            "
            id="noise-input-demo"
            placeholder="Try typing…"
            type="search"
          />
        </div>
      </TextField>
    </div>
  )
}
