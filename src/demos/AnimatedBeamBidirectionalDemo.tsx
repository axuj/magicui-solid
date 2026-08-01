import { Circle } from '@/demos/shared/circle'
import { Icons } from '@/demos/shared/icons'
import { AnimatedBeam } from '@/registry/magicui/animated-beam'

export function AnimatedBeamBidirectionalDemo() {
  let containerRef: HTMLDivElement | undefined
  let div1Ref: HTMLDivElement | undefined
  let div2Ref: HTMLDivElement | undefined

  return (
    <div
      ref={containerRef}
      class="
        relative flex w-full max-w-125 items-center justify-center
        overflow-hidden p-10
      "
    >
      <div class="flex size-full flex-col items-stretch justify-between gap-10">
        <div class="flex flex-row justify-between">
          <Circle ref={div1Ref}>
            <Icons.user />
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.openai />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={() => containerRef}
        fromRef={() => div1Ref}
        toRef={() => div2Ref}
        startYOffset={10}
        endYOffset={10}
        curvature={-20}
      />
      <AnimatedBeam
        containerRef={() => containerRef}
        fromRef={() => div1Ref}
        toRef={() => div2Ref}
        startYOffset={-10}
        endYOffset={-10}
        curvature={20}
        reverse
      />
    </div>
  )
}
