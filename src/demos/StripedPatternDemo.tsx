import { StripedPattern } from '@/registry/magicui/striped-pattern'

export function StripedPatternDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border
    "
    >
      <StripedPattern class="
        mask-[radial-gradient(300px_circle_at_center,white,transparent)]
      "
      />
    </div>
  )
}
