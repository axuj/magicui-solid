import { Circle } from '@/demos/shared/circle'
import { Icons } from '@/demos/shared/icons'
import { AnimatedBeam } from '@/registry/magicui/animated-beam'

export function AnimatedBeamMultipleInputsDemo() {
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
        relative flex h-125 w-full items-center justify-center overflow-hidden
        p-10
      "
    >
      <div class="
        flex size-full max-w-lg flex-row items-stretch justify-between gap-10
      "
      >
        <div class="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            <Icons.googleDrive />
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.googleDocs />
          </Circle>
          <Circle ref={div3Ref}>
            <Icons.whatsapp />
          </Circle>
          <Circle ref={div4Ref}>
            <Icons.messenger />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.notion />
          </Circle>
        </div>
        <div class="flex flex-col justify-center">
          <Circle ref={div6Ref} class="size-16">
            <Icons.openai />
          </Circle>
        </div>
        <div class="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <Icons.user />
          </Circle>
        </div>
      </div>

      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div1Ref} toRef={() => div6Ref} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div2Ref} toRef={() => div6Ref} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div3Ref} toRef={() => div6Ref} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div4Ref} toRef={() => div6Ref} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div5Ref} toRef={() => div6Ref} />
      <AnimatedBeam containerRef={() => containerRef} fromRef={() => div6Ref} toRef={() => div7Ref} />
    </div>
  )
}
