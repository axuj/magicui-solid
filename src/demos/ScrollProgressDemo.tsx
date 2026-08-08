import { ScrollProgress } from '@/registry/magicui/scroll-progress'

export function ScrollProgressDemo() {
  return (
    <div class="z-10 rounded-lg p-4">
      <ScrollProgress class="top-16.25" />
      <h2 class="pb-4 font-bold">
        Note: The scroll progress is shown below the navbar of the page.
      </h2>
    </div>
  )
}
