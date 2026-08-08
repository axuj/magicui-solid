import { ShimmerButton } from '@/registry/magicui/shimmer-button'

export function ShimmerButtonDemo() {
  return (
    <ShimmerButton class="shadow-2xl">
      <span class="
        text-center text-sm leading-none font-medium tracking-tight
        whitespace-pre-wrap text-white
        lg:text-lg
        dark:from-white dark:to-slate-900/10
      "
      >
        Shimmer Button
      </span>
    </ShimmerButton>
  )
}
