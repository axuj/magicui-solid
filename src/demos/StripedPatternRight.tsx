import { StripedPattern } from '@/registry/magicui/striped-pattern'

export function StripedPatternRight() {
  return (
    <div class="
      relative flex h-75 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border
    "
    >
      <StripedPattern direction="right" />
    </div>
  )
}
