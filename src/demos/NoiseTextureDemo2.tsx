import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TextField, TextFieldInput, TextFieldLabel } from '@/components/ui/text-field'
import { NoiseTexture } from '@/registry/magicui/noise-texture'

export function NoiseTextureDemo2() {
  return (
    <div class="flex justify-center p-4">
      <Card class="relative w-full max-w-md overflow-hidden border bg-card/80">
        <NoiseTexture noiseOpacity={0.45} />
        <CardHeader class="relative z-10 space-y-1 pb-4">
          <CardTitle class="text-xl">The weekly digest</CardTitle>
          <CardDescription>
            One email on Sundays—new components, tips, and changelog highlights.
            No spam, unsubscribe anytime.
          </CardDescription>
        </CardHeader>
        <CardContent class="relative z-10 space-y-4 pt-0">
          <TextField class="space-y-2">
            <TextFieldLabel for="newsletter-email">Email</TextFieldLabel>
            <TextFieldInput
              id="newsletter-email"
              autocomplete="email"
              placeholder="you@company.com"
              type="email"
            />
          </TextField>
          <Button class="w-full" type="button">
            Subscribe
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
