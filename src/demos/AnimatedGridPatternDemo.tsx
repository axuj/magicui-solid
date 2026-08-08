import { AnimatedGridPattern } from '@/registry/magicui/animated-grid-pattern'

export function AnimatedGridPatternDemo() {
  return (
    <div class="
      relative flex h-125 w-full items-center justify-center overflow-hidden
      rounded-lg border bg-background p-20
    "
    >
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        class="
          inset-x-0 inset-y-[-30%] h-[200%] skew-y-12
          mask-[radial-gradient(500px_circle_at_center,white,transparent)]
        "
      />
    </div>
  )
}
