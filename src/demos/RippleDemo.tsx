import { Ripple } from '@/registry/magicui/ripple'

export function RippleDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <p class="
        z-10 text-center text-5xl font-medium tracking-tighter
        whitespace-pre-wrap text-white
      "
      >
        Ripple
      </p>
      <Ripple />
    </div>
  )
}
