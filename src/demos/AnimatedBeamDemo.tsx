import { Circle } from '@/demos/shared/circle'
import { Icons } from '@/demos/shared/icons'
import { AnimatedBeam } from '@/registry/magicui/animated-beam'

export function AnimatedBeamDemo() {
  let containerRef: HTMLDivElement | undefined
  let div1Ref: HTMLDivElement | undefined
  let div2Ref: HTMLDivElement | undefined
  let div3Ref: HTMLDivElement | undefined
  let div4Ref: HTMLDivElement | undefined
  let div5Ref: HTMLDivElement | undefined
  let div6Ref: HTMLDivElement | undefined
  let div7Ref: HTMLDivElement | undefined

  return (
    <div
      ref={containerRef}
      class="
        relative flex h-75 w-full items-center justify-center overflow-hidden
        p-10
      "
    >
      <div class="
        flex size-full max-h-50 max-w-lg flex-col items-stretch justify-between
        gap-10
      "
      >
        <div class="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Icons.googleDrive />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.googleDocs />
          </Circle>
        </div>
        <div class="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Icons.notion />
          </Circle>
          <Circle ref={div4Ref} class="size-16">
            <Icons.openai />
          </Circle>
          <Circle ref={div6Ref}>
            <Icons.zapier />
          </Circle>
        </div>
        <div class="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Icons.whatsapp />
          </Circle>
          <Circle ref={div7Ref}>
            <Icons.messenger />
          </Circle>
        </div>
      </div>

      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div1Ref} toRef={() => div4Ref} curvature={-75} endYOffset={-10} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div2Ref} toRef={() => div4Ref} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div3Ref} toRef={() => div4Ref} curvature={75} endYOffset={10} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div5Ref} toRef={() => div4Ref} curvature={-75} endYOffset={-10} reverse />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div6Ref} toRef={() => div4Ref} reverse />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div7Ref} toRef={() => div4Ref} curvature={75} endYOffset={10} reverse />
    </div>
  )
}
