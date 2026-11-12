import { ChevronRight } from '@lucide/solid'
import { cn } from '@/lib/utils'
import { AnimatedGradientText } from '@/registry/magicui/animated-gradient-text'

export function AnimatedGradientTextDemo() {
  return (
    <div class="
      group relative mx-auto flex items-center justify-center rounded-full px-4
      py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500
      ease-out
      hover:shadow-[inset_0_-5px_10px_#8fdfff3f]
    "
    >
      <span
        class={cn(
          `
            absolute inset-0 block size-full animate-gradient rounded-[inherit]
            bg-linear-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50
            bg-size-[300%_100%] p-px
          `,
        )}
        style={{
          '-webkit-mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          '-webkit-mask-composite': 'destination-out',
          'mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          'mask-composite': 'subtract',
          '-webkit-clip-path': 'padding-box',
        }}
      />
      🎉
      {' '}
      <hr class="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
      <AnimatedGradientText class="text-sm font-medium">
        Introducing Magic UI
      </AnimatedGradientText>
      <ChevronRight class="
        ml-1 size-4 stroke-neutral-500 transition-transform duration-300
        ease-in-out
        group-hover:translate-x-0.5
      "
      />
    </div>
  )
}
