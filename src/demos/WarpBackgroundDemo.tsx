import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { WarpBackground } from '@/registry/magicui/warp-background'

export function WarpBackgroundDemo() {
  return (
    <WarpBackground>
      <Card class="w-80">
        <CardContent class="flex flex-col gap-2 p-4">
          <CardTitle>Congratulations on Your Promotion!</CardTitle>
          <CardDescription>
            Your hard work and dedication have paid off. We&apos;re thrilled to
            see you take this next step in your career. Keep up the fantastic
            work!
          </CardDescription>
        </CardContent>
      </Card>
    </WarpBackground>
  )
}
