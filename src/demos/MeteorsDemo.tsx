import { Meteors } from '@/registry/magicui/meteors'

export function MeteorsDemo() {
  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border
    "
    >
      <Meteors number={30} />
      <span class="
        pointer-events-none bg-linear-to-b from-black to-gray-300/80
        bg-clip-text text-center text-8xl leading-none font-semibold
        whitespace-pre-wrap text-transparent
        dark:from-white dark:to-slate-900/10
      "
      >
        Meteors
      </span>
    </div>
  )
}
