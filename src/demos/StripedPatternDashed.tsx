import { StripedPattern } from '@/registry/magicui/striped-pattern'

export function StripedPatternDashed() {
  return (
    <div class="
      relative flex h-75 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border
    "
    >
      <StripedPattern class="stroke-[0.3] [stroke-dasharray:8,4]" />
    </div>
  )
}
