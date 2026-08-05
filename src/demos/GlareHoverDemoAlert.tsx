import { CircleCheck, Info, TriangleAlert } from 'lucide-solid'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { GlareHover } from '@/registry/magicui/glare-hover'

export function GlareHoverDemoAlert() {
  return (
    <div class="flex flex-col gap-3">
      <GlareHover class="rounded-lg" duration={550} opacity={0.25}>
        <Alert class="[&>svg~*]:pl-10">
          <Info />
          <AlertTitle>Action required</AlertTitle>
          <AlertDescription>
            Your plan expires in 3 days. Renew to keep access.
          </AlertDescription>
        </Alert>
      </GlareHover>

      <GlareHover
        class="w-full rounded-lg"
        color="#ff6070"
        opacity={0.25}
        duration={550}
      >
        <Alert
          variant="destructive"
          class="
            bg-background
            [&>svg~*]:pl-10
          "
        >
          <TriangleAlert />
          <AlertTitle>Payment declined</AlertTitle>
          <AlertDescription>
            Check your card details and try again.
          </AlertDescription>
        </Alert>
      </GlareHover>

      <GlareHover
        class="w-full rounded-lg"
        color="#60ff70"
        opacity={0.25}
        duration={550}
      >
        <Alert class="[&>svg~*]:pl-10">
          <CircleCheck class="stroke-emerald-500" />
          <AlertTitle class="text-emerald-500">
            Subscription confirmed
          </AlertTitle>
          <AlertDescription class="text-emerald-500">
            You have full Pro access until April 5, 2027.
          </AlertDescription>
        </Alert>
      </GlareHover>
    </div>
  )
}
