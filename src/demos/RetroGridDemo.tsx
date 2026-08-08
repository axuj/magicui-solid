import { RetroGrid } from '@/registry/magicui/retro-grid'

export function RetroGridDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <span class="
        pointer-events-none z-10 bg-linear-to-b from-[#ffd319] via-[#ff2975]
        to-[#8c1eff] bg-clip-text text-center text-7xl leading-none font-bold
        tracking-tighter whitespace-pre-wrap text-transparent
      "
      >
        Retro Grid
      </span>

      <RetroGrid />
    </div>
  )
}
