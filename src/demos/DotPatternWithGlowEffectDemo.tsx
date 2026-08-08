import { DotPattern } from '@/registry/magicui/dot-pattern'

export function DotPatternWithGlowEffectDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden
    "
    >
      <DotPattern
        glow={true}
        class="mask-[radial-gradient(300px_circle_at_center,white,transparent)]"
      />
    </div>
  )
}
