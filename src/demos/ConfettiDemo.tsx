import type { ConfettiRef } from '@/registry/magicui/confetti'
import { Confetti } from '@/registry/magicui/confetti'

export function ConfettiDemo() {
  let confettiRef: ConfettiRef | undefined

  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <span class="
        pointer-events-none bg-linear-to-b from-black to-gray-300/80
        bg-clip-text text-center text-8xl leading-none font-semibold
        whitespace-pre-wrap text-transparent
        dark:from-white dark:to-slate-900/10
      "
      >
        Confetti
      </span>

      <Confetti
        ref={(api) => {
          confettiRef = api
        }}
        class="absolute top-0 left-0 z-0 size-full"
        onMouseEnter={() => {
          confettiRef?.fire({})
        }}
      />
    </div>
  )
}
